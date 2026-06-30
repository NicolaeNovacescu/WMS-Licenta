using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Domain.Transfer;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentTransferSeeder
{
    private static readonly TransferTaskSeed[] TransferTasks =
    [
        new(
            Guid.Parse("2fdde9af-e1a9-4872-8f2d-f1aa2bd64a10"),
            "FG-1000",
            "MAIN",
            "PICK-A-01",
            "MAIN",
            "STAGE-A-02",
            4m,
            "Reposition overflow stock from picking to staging",
            TransferTaskStatus.Pending),
    ];

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var productsBySku = (await dbContext.Products.ToArrayAsync(cancellationToken))
            .ToDictionary(product => product.Sku, StringComparer.OrdinalIgnoreCase);

        var locationsByWarehouseAndCode = (await dbContext.Locations
                .Include(location => location.Warehouse)
                .Include(location => location.Zone)
                .ThenInclude(zone => zone.Warehouse)
                .ToArrayAsync(cancellationToken))
            .ToDictionary(
                location => ComposeKey(location.Warehouse.Code, location.Code),
                StringComparer.OrdinalIgnoreCase);

        var transferTasksById = (await dbContext.TransferTasks
                .Include(transferTask => transferTask.Product)
                .Include(transferTask => transferTask.SourceLocation)
                .Include(transferTask => transferTask.DestinationLocation)
                .ToArrayAsync(cancellationToken))
            .ToDictionary(transferTask => transferTask.Id);

        var ensuredCount = 0;

        foreach (var definition in TransferTasks)
        {
            if (!productsBySku.TryGetValue(definition.ProductSku, out var product) ||
                !locationsByWarehouseAndCode.TryGetValue(
                    ComposeKey(definition.SourceWarehouseCode, definition.SourceLocationCode),
                    out var sourceLocation) ||
                !locationsByWarehouseAndCode.TryGetValue(
                    ComposeKey(definition.DestinationWarehouseCode, definition.DestinationLocationCode),
                    out var destinationLocation))
            {
                logger.LogWarning(
                    "Development transfer seed skipped task {TransferTaskId} because the required product or locations are unavailable.",
                    definition.Id);
                continue;
            }

            if (!transferTasksById.TryGetValue(definition.Id, out var transferTask))
            {
                transferTask = new TransferTask
                {
                    Id = definition.Id,
                };

                dbContext.TransferTasks.Add(transferTask);
                transferTasksById[definition.Id] = transferTask;
            }

            transferTask.ProductId = product.Id;
            transferTask.Product = product;
            transferTask.SourceLocationId = sourceLocation.Id;
            transferTask.SourceLocation = sourceLocation;
            transferTask.DestinationLocationId = destinationLocation.Id;
            transferTask.DestinationLocation = destinationLocation;
            transferTask.Quantity = decimal.Round(definition.Quantity, 2, MidpointRounding.AwayFromZero);
            transferTask.Status = definition.Status;
            transferTask.Reason = definition.Reason;
            transferTask.CreatedAtUtc = DateTimeOffset.UtcNow;
            transferTask.StartedAtUtc = null;
            transferTask.CompletedAtUtc = null;
            transferTask.CancelledAtUtc = null;

            ensuredCount++;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development transfer seed ensured {TransferTaskCount} transfer tasks.",
            ensuredCount);
    }

    private static string ComposeKey(string left, string right) => $"{left}::{right}";

    private sealed record TransferTaskSeed(
        Guid Id,
        string ProductSku,
        string SourceWarehouseCode,
        string SourceLocationCode,
        string DestinationWarehouseCode,
        string DestinationLocationCode,
        decimal Quantity,
        string Reason,
        string Status);
}
