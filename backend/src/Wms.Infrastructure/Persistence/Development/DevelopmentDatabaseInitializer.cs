using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wms.Application.Authentication.Abstractions;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentDatabaseInitializer
{
    private const int MaxMigrationAttempts = 10;
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(2);

    public static async Task InitializeDevelopmentDatabaseAsync(
        this IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();

        var logger = scope.ServiceProvider
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("DevelopmentDatabaseInitializer");

        var dbContext = scope.ServiceProvider.GetRequiredService<WmsDbContext>();
        var seedOptions = scope.ServiceProvider
            .GetRequiredService<IOptions<DevelopmentSeedOptions>>()
            .Value;

        if (seedOptions.ApplyMigrations)
        {
            await ApplyMigrationsWithRetryAsync(dbContext, logger, cancellationToken);
        }
        else
        {
            logger.LogInformation(
                "Development database migrations skipped because DevelopmentSeed:ApplyMigrations is false.");
        }

        if (seedOptions.SeedAuth)
        {
            var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            await DevelopmentAuthSeeder.SeedAsync(dbContext, passwordHasher, logger, cancellationToken);
        }
        else
        {
            logger.LogInformation(
                "Development auth seeding skipped because DevelopmentSeed:SeedAuth is false.");
        }

        if (!seedOptions.SeedDemoData)
        {
            logger.LogInformation(
                "Development demo data seeding skipped because DevelopmentSeed:SeedDemoData is false.");

            return;
        }

        logger.LogInformation(
            "Development demo data seeding enabled because DevelopmentSeed:SeedDemoData is true.");

        await DevelopmentMasterDataSeeder.SeedAsync(dbContext, logger, cancellationToken);
        await DevelopmentInventorySeeder.SeedAsync(dbContext, logger, cancellationToken);
        await DevelopmentInventoryMovementSeeder.SeedAsync(dbContext, logger, cancellationToken);
        await DevelopmentInboundReceiptSeeder.SeedAsync(dbContext, logger, cancellationToken);
        await DevelopmentTransferSeeder.SeedAsync(dbContext, logger, cancellationToken);
        await DevelopmentCustomerSeeder.SeedAsync(dbContext, logger, cancellationToken);
        await DevelopmentSalesOrderSeeder.SeedAsync(dbContext, logger, cancellationToken);
    }

    private static async Task ApplyMigrationsWithRetryAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        for (var attempt = 1; attempt <= MaxMigrationAttempts; attempt++)
        {
            try
            {
                await dbContext.Database.MigrateAsync(cancellationToken);

                logger.LogInformation(
                    "Development database migrations applied successfully on attempt {Attempt}.",
                    attempt);

                return;
            }
            catch (Exception exception) when (
                attempt < MaxMigrationAttempts &&
                IsRetryable(exception))
            {
                logger.LogWarning(
                    exception,
                    "Development database migration attempt {Attempt} failed. Retrying in {DelaySeconds} seconds.",
                    attempt,
                    RetryDelay.TotalSeconds);

                await Task.Delay(RetryDelay, cancellationToken);
            }
        }
    }

    private static bool IsRetryable(Exception exception) =>
        exception is DbException or TimeoutException ||
        exception.InnerException is DbException or TimeoutException;
}
