using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Domain.Sales;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentCustomerSeeder
{
    private static readonly CustomerSeed[] Customers =
    [
        new(
            Guid.Parse("2F120A6A-EB4F-4C53-B9F0-B24A0C225101"),
            "CUST-ALPHA",
            "Demo Customer Alpha",
            true),
        new(
            Guid.Parse("2AF371A0-C1CA-47F8-BB7F-7F8FBCA6CB92"),
            "CUST-BETA",
            "Demo Customer Beta",
            true),
    ];

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var customersByCode = (await dbContext.Customers
                .ToArrayAsync(cancellationToken))
            .GroupBy(customer => customer.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in Customers)
        {
            if (!customersByCode.TryGetValue(definition.Code, out var customer))
            {
                customer = new Customer
                {
                    Id = definition.Id,
                    Code = definition.Code,
                };

                dbContext.Customers.Add(customer);
                customersByCode[definition.Code] = customer;
            }

            customer.Name = definition.Name;
            customer.IsActive = definition.IsActive;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development customer seed ensured {CustomerCount} customers.",
            Customers.Length);
    }

    private sealed record CustomerSeed(Guid Id, string Code, string Name, bool IsActive);
}
