using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentInventorySeeder
{
    private static readonly InventoryBalanceSeed[] InventoryBalances =
    [
        new("FG-1000", "MAIN", "PICK-A-01", 24m, 6m, new DateTimeOffset(2026, 3, 14, 9, 0, 0, TimeSpan.Zero)),
        new("FG-1000", "MAIN", "STAGE-B-01", 8m, 0m, new DateTimeOffset(2026, 3, 14, 9, 30, 0, TimeSpan.Zero)),
        new("RM-2000", "MAIN", "REC-A-01", 40m, 0m, new DateTimeOffset(2026, 3, 14, 8, 45, 0, TimeSpan.Zero)),
        new("RM-2000", "MAIN", "PICK-A-01", 12m, 2m, new DateTimeOffset(2026, 3, 14, 9, 15, 0, TimeSpan.Zero)),
    ];

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var productsBySku = await dbContext.Products
            .ToDictionaryAsync(product => product.Sku, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var locationsByWarehouseAndCode = await dbContext.Locations
            .Include(location => location.Warehouse)
            .ToDictionaryAsync(
                location => ComposeKey(location.Warehouse.Code, location.Code),
                StringComparer.OrdinalIgnoreCase,
                cancellationToken);

        var balances = await dbContext.InventoryBalances
            .ToArrayAsync(cancellationToken);

        var balancesByProductAndLocation = balances.ToDictionary(
            balance => ComposeKey(balance.ProductId, balance.LocationId),
            balance => balance);

        foreach (var definition in InventoryBalances)
        {
            if (!productsBySku.TryGetValue(definition.ProductSku, out var product))
            {
                throw new InvalidOperationException(
                    $"Development inventory seed could not find product '{definition.ProductSku}'.");
            }

            if (!locationsByWarehouseAndCode.TryGetValue(
                    ComposeKey(definition.WarehouseCode, definition.LocationCode),
                    out var location))
            {
                throw new InvalidOperationException(
                    $"Development inventory seed could not find location '{definition.WarehouseCode}/{definition.LocationCode}'.");
            }

            if (definition.ReservedQuantity > definition.OnHandQuantity)
            {
                throw new InvalidOperationException(
                    $"Reserved quantity cannot exceed on-hand quantity for '{definition.ProductSku}' in '{definition.LocationCode}'.");
            }

            var balanceKey = ComposeKey(product.Id, location.Id);
            if (!balancesByProductAndLocation.TryGetValue(balanceKey, out var balance))
            {
                balance = new InventoryBalance
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    Product = product,
                    LocationId = location.Id,
                    Location = location,
                };

                dbContext.InventoryBalances.Add(balance);
                balancesByProductAndLocation[balanceKey] = balance;
            }

            balance.ProductId = product.Id;
            balance.Product = product;
            balance.LocationId = location.Id;
            balance.Location = location;
            balance.OnHandQuantity = definition.OnHandQuantity;
            balance.ReservedQuantity = definition.ReservedQuantity;
            balance.UpdatedAtUtc = definition.UpdatedAtUtc;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development inventory seed ensured {BalanceCount} inventory balances.",
            InventoryBalances.Length);
    }

    private static string ComposeKey(string left, string right) => $"{left}::{right}";
    private static string ComposeKey(Guid left, Guid right) => $"{left:N}::{right:N}";

    private sealed record InventoryBalanceSeed(
        string ProductSku,
        string WarehouseCode,
        string LocationCode,
        decimal OnHandQuantity,
        decimal ReservedQuantity,
        DateTimeOffset UpdatedAtUtc);
}
