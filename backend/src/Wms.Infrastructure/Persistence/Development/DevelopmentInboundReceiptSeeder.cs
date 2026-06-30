using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Domain.Inbound;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentInboundReceiptSeeder
{
    private static readonly SupplierSeed[] Suppliers =
    [
        new(
            Guid.Parse("3B7C214E-62E9-4715-8F93-B6C7A3431F01"),
            "SUP-ALPHA",
            "Demo Supplier Alpha",
            true),
        new(
            Guid.Parse("90EE75EA-B6CB-43C9-947A-3E0C862CFF7E"),
            "SUP-BETA",
            "Demo Supplier Beta",
            true),
    ];

    private static readonly InboundOrderSeed DemoInboundOrder = new(
        Guid.Parse("9862478A-0EFC-4D22-9A2D-71994BFA9E3C"),
        "SUP-ALPHA",
        "INV-2026-0001",
        "Demo inbound order prepared for first receipt workflow testing.",
        InboundOrderStatus.ReadyForReceipt,
        [
            new(
                Guid.Parse("CE81A84D-6D61-4EAA-9B75-8E0B2FAF31E1"),
                "FG-1000",
                12m),
            new(
                Guid.Parse("7A677D5E-E05C-47E5-A99E-310772470DAB"),
                "RM-2000",
                6m),
        ]);

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var suppliersByCode = (await dbContext.Suppliers
                .ToArrayAsync(cancellationToken))
            .GroupBy(supplier => supplier.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in Suppliers)
        {
            if (!suppliersByCode.TryGetValue(definition.Code, out var supplier))
            {
                supplier = new Supplier
                {
                    Id = definition.Id,
                    Code = definition.Code,
                };

                dbContext.Suppliers.Add(supplier);
                suppliersByCode[definition.Code] = supplier;
            }

            supplier.Name = definition.Name;
            supplier.IsActive = definition.IsActive;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var existingInboundOrder = await dbContext.InboundOrders
            .AsNoTracking()
            .SingleOrDefaultAsync(order => order.Id == DemoInboundOrder.Id, cancellationToken);

        if (existingInboundOrder is not null)
        {
            logger.LogInformation(
                "Development inbound workflow seed kept existing inbound order {InboundOrderId}.",
                DemoInboundOrder.Id);

            return;
        }

        var productsBySku = await dbContext.Products
            .ToDictionaryAsync(product => product.Sku, StringComparer.OrdinalIgnoreCase, cancellationToken);

        if (!productsBySku.ContainsKey("FG-1000") || !productsBySku.ContainsKey("RM-2000"))
        {
            logger.LogWarning(
                "Development inbound workflow seed skipped because required demo products were not present.");

            return;
        }

        var supplierForOrder = suppliersByCode[DemoInboundOrder.SupplierCode];
        var inboundOrder = new InboundOrder
        {
            Id = DemoInboundOrder.Id,
            SupplierId = supplierForOrder.Id,
            Supplier = supplierForOrder,
            SupplierInvoiceReference = DemoInboundOrder.SupplierInvoiceReference,
            Status = DemoInboundOrder.Status,
            Notes = DemoInboundOrder.Notes,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

        foreach (var lineDefinition in DemoInboundOrder.Lines)
        {
            var product = productsBySku[lineDefinition.ProductSku];

            inboundOrder.Lines.Add(new InboundOrderLine
            {
                Id = lineDefinition.Id,
                InboundOrderId = inboundOrder.Id,
                InboundOrder = inboundOrder,
                ProductId = product.Id,
                Product = product,
                ExpectedQuantity = lineDefinition.ExpectedQuantity,
                ReceivedQuantity = 0m,
            });
        }

        dbContext.InboundOrders.Add(inboundOrder);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development inbound workflow seed created {SupplierCount} suppliers and demo inbound order {InboundOrderId}.",
            Suppliers.Length,
            DemoInboundOrder.Id);
    }

    private sealed record SupplierSeed(Guid Id, string Code, string Name, bool IsActive);

    private sealed record InboundOrderSeed(
        Guid Id,
        string SupplierCode,
        string SupplierInvoiceReference,
        string Notes,
        string Status,
        IReadOnlyList<InboundOrderLineSeed> Lines);

    private sealed record InboundOrderLineSeed(Guid Id, string ProductSku, decimal ExpectedQuantity);
}
