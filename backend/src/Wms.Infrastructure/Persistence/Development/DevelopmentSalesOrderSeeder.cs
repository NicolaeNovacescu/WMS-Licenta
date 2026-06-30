using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Sales;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentSalesOrderSeeder
{
    private static readonly Guid DemoSalesOrderId = Guid.Parse("f1e3a7cb-4cca-4b1d-8a1f-417f37d03f65");
    private static readonly DateTimeOffset DemoCreatedAtUtc = new(2026, 3, 14, 8, 50, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset DemoConfirmedAtUtc = new(2026, 3, 14, 9, 20, 0, TimeSpan.Zero);
    private const string DemoCustomerCode = "CUST-ALPHA";

    private static readonly SalesOrderLineSeed[] DemoLines =
    [
        new(
            Guid.Parse("730362e0-ffec-4af1-9a1c-c6f624fe109e"),
            Guid.Parse("87542325-58d2-4127-ad0d-f58ff3592c5e"),
            "FG-1000",
            "MAIN",
            "PICK-A-01",
            6m),
        new(
            Guid.Parse("a498f96b-340f-47df-81d4-8a3e63fa1fe8"),
            Guid.Parse("db09c58f-af11-41fc-bf8d-d8b460f8819f"),
            "RM-2000",
            "MAIN",
            "PICK-A-01",
            2m),
    ];

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var productsBySku = await dbContext.Products
            .ToDictionaryAsync(product => product.Sku, StringComparer.OrdinalIgnoreCase, cancellationToken);
        var customersByCode = await dbContext.Customers
            .ToDictionaryAsync(customer => customer.Code, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var locationsByWarehouseAndCode = await dbContext.Locations
            .Include(location => location.Warehouse)
            .ToDictionaryAsync(
                location => ComposeKey(location.Warehouse.Code, location.Code),
                StringComparer.OrdinalIgnoreCase,
                cancellationToken);

        var balancesByProductAndLocation = await dbContext.InventoryBalances
            .Include(balance => balance.Product)
            .Include(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .ToDictionaryAsync(
                balance => ComposeKey(balance.ProductId, balance.LocationId),
                cancellationToken);

        var salesOrder = await dbContext.SalesOrders
            .Include(order => order.Lines)
            .ThenInclude(line => line.Reservations)
            .SingleOrDefaultAsync(order => order.Id == DemoSalesOrderId, cancellationToken);

        if (salesOrder is null)
        {
            salesOrder = new SalesOrder
            {
                Id = DemoSalesOrderId,
            };

            dbContext.SalesOrders.Add(salesOrder);
        }

        if (!customersByCode.TryGetValue(DemoCustomerCode, out var customer))
        {
            throw new InvalidOperationException(
                $"Development sales-order seed could not find customer '{DemoCustomerCode}'.");
        }

        var expectedLineIds = DemoLines.Select(line => line.LineId).ToHashSet();
        var extraLines = salesOrder.Lines
            .Where(line => !expectedLineIds.Contains(line.Id))
            .ToArray();

        if (extraLines.Length > 0)
        {
            dbContext.SalesOrderLines.RemoveRange(extraLines);
        }

        salesOrder.Status = SalesOrderStatus.FullyReserved;
        salesOrder.CustomerId = customer.Id;
        salesOrder.Customer = customer;
        salesOrder.CreatedAtUtc = DemoCreatedAtUtc;
        salesOrder.UpdatedAtUtc = DemoConfirmedAtUtc;
        salesOrder.ConfirmedAtUtc = DemoConfirmedAtUtc;
        salesOrder.CancelledAtUtc = null;

        foreach (var lineSeed in DemoLines)
        {
            if (!productsBySku.TryGetValue(lineSeed.ProductSku, out var product))
            {
                throw new InvalidOperationException(
                    $"Development sales-order seed could not find product '{lineSeed.ProductSku}'.");
            }

            if (!locationsByWarehouseAndCode.TryGetValue(
                    ComposeKey(lineSeed.WarehouseCode, lineSeed.LocationCode),
                    out var location))
            {
                throw new InvalidOperationException(
                    $"Development sales-order seed could not find location '{lineSeed.WarehouseCode}/{lineSeed.LocationCode}'.");
            }

            if (!balancesByProductAndLocation.TryGetValue(ComposeKey(product.Id, location.Id), out var balance))
            {
                throw new InvalidOperationException(
                    $"Development sales-order seed could not find the inventory balance for product '{lineSeed.ProductSku}' in location '{lineSeed.LocationCode}'.");
            }

            var line = salesOrder.Lines.SingleOrDefault(existingLine => existingLine.Id == lineSeed.LineId);
            if (line is null)
            {
                line = new SalesOrderLine
                {
                    Id = lineSeed.LineId,
                    SalesOrderId = salesOrder.Id,
                    SalesOrder = salesOrder,
                };

                salesOrder.Lines.Add(line);
            }

            var extraReservations = line.Reservations
                .Where(reservation => reservation.Id != lineSeed.ReservationId)
                .ToArray();

            if (extraReservations.Length > 0)
            {
                dbContext.SalesOrderReservations.RemoveRange(extraReservations);
            }

            line.ProductId = product.Id;
            line.Product = product;
            line.OrderedQuantity = lineSeed.Quantity;
            line.ReservedQuantity = lineSeed.Quantity;
            line.PickedQuantity = 0m;

            var reservation = line.Reservations.SingleOrDefault(existingReservation => existingReservation.Id == lineSeed.ReservationId);
            if (reservation is null)
            {
                reservation = new SalesOrderReservation
                {
                    Id = lineSeed.ReservationId,
                    SalesOrderLineId = line.Id,
                    SalesOrderLine = line,
                };

                line.Reservations.Add(reservation);
            }

            reservation.InventoryBalanceId = balance.Id;
            reservation.InventoryBalance = balance;
            reservation.Quantity = lineSeed.Quantity;
            reservation.PickedQuantity = 0m;
            reservation.CreatedAtUtc = DemoConfirmedAtUtc;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development sales-order seed ensured demo sales order {SalesOrderId} with {LineCount} reserved lines.",
            DemoSalesOrderId,
            DemoLines.Length);
    }

    private static string ComposeKey(string left, string right) => $"{left}::{right}";
    private static string ComposeKey(Guid left, Guid right) => $"{left:N}::{right:N}";

    private sealed record SalesOrderLineSeed(
        Guid LineId,
        Guid ReservationId,
        string ProductSku,
        string WarehouseCode,
        string LocationCode,
        decimal Quantity);
}
