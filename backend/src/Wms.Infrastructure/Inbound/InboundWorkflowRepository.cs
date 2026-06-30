using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.Inbound.Abstractions;
using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Inbound;

public sealed class InboundWorkflowRepository(WmsDbContext dbContext) : IInboundWorkflowRepository
{
    public async Task<IReadOnlyList<InboundOrder>> ListInboundOrdersAsync(CancellationToken cancellationToken) =>
        await InboundOrdersQuery()
            .OrderByDescending(inboundOrder => inboundOrder.CreatedAtUtc)
            .ThenBy(inboundOrder => inboundOrder.SupplierInvoiceReference)
            .ToArrayAsync(cancellationToken);

    public Task<InboundOrder?> FindInboundOrderByIdAsync(Guid inboundOrderId, CancellationToken cancellationToken) =>
        InboundOrdersQuery()
            .SingleOrDefaultAsync(inboundOrder => inboundOrder.Id == inboundOrderId, cancellationToken);

    public Task<Supplier?> FindSupplierByIdAsync(Guid supplierId, CancellationToken cancellationToken) =>
        dbContext.Suppliers
            .SingleOrDefaultAsync(supplier => supplier.Id == supplierId, cancellationToken);

    public async Task<IReadOnlyDictionary<Guid, Product>> FindProductsByIdsAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken)
    {
        if (productIds.Count == 0)
        {
            return new Dictionary<Guid, Product>();
        }

        return await dbContext.Products
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken)
    {
        if (locationIds.Count == 0)
        {
            return new Dictionary<Guid, Location>();
        }

        return await dbContext.Locations
            .Include(location => location.Warehouse)
            .Include(location => location.Zone)
            .Where(location => locationIds.Contains(location.Id))
            .ToDictionaryAsync(location => location.Id, cancellationToken);
    }

    public void AddInboundOrder(InboundOrder inboundOrder) => dbContext.InboundOrders.Add(inboundOrder);

    public void RemoveInboundOrderLines(IEnumerable<InboundOrderLine> lines) =>
        dbContext.InboundOrderLines.RemoveRange(lines);

    public async Task<IReadOnlyList<Receipt>> ListReceiptsAsync(CancellationToken cancellationToken) =>
        await ReceiptsQuery()
            .OrderByDescending(receipt => receipt.CreatedAtUtc)
            .ThenBy(receipt => receipt.Id)
            .ToArrayAsync(cancellationToken);

    public Task<Receipt?> FindReceiptByIdAsync(Guid receiptId, CancellationToken cancellationToken) =>
        ReceiptsQuery()
            .SingleOrDefaultAsync(receipt => receipt.Id == receiptId, cancellationToken);

    public void AddReceipt(Receipt receipt) => dbContext.Receipts.Add(receipt);

    public Task<InventoryBalance?> FindInventoryBalanceAsync(
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken) =>
        dbContext.InventoryBalances.SingleOrDefaultAsync(
            balance => balance.ProductId == productId && balance.LocationId == locationId,
            cancellationToken);

    public void AddInventoryBalance(InventoryBalance balance) => dbContext.InventoryBalances.Add(balance);

    public void AddInventoryMovement(InventoryMovement movement) => dbContext.InventoryMovements.Add(movement);

    public async Task<IInboundWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfInboundWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<InboundOrder> InboundOrdersQuery() =>
        dbContext.InboundOrders
            .AsSplitQuery()
            .Include(inboundOrder => inboundOrder.Supplier)
            .Include(inboundOrder => inboundOrder.Lines)
            .ThenInclude(line => line.Product);

    private IQueryable<Receipt> ReceiptsQuery() =>
        dbContext.Receipts
            .AsSplitQuery()
            .Include(receipt => receipt.InboundOrder)
            .ThenInclude(inboundOrder => inboundOrder.Supplier)
            .Include(receipt => receipt.InboundOrder)
            .ThenInclude(inboundOrder => inboundOrder.Lines)
            .ThenInclude(line => line.Product)
            .Include(receipt => receipt.Lines)
            .ThenInclude(line => line.InboundOrderLine)
            .ThenInclude(line => line.Product)
            .Include(receipt => receipt.Lines)
            .ThenInclude(line => line.ReceivingLocation)
            .ThenInclude(location => location!.Warehouse)
            .Include(receipt => receipt.Lines)
            .ThenInclude(line => line.ReceivingLocation)
            .ThenInclude(location => location!.Zone);

    private sealed class EfInboundWorkflowTransaction(IDbContextTransaction transaction) : IInboundWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
