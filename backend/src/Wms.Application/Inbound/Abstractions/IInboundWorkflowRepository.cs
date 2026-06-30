using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Inbound.Abstractions;

public interface IInboundWorkflowRepository
{
    Task<IReadOnlyList<InboundOrder>> ListInboundOrdersAsync(CancellationToken cancellationToken);
    Task<InboundOrder?> FindInboundOrderByIdAsync(Guid inboundOrderId, CancellationToken cancellationToken);
    Task<Supplier?> FindSupplierByIdAsync(Guid supplierId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Product>> FindProductsByIdsAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken);
    void AddInboundOrder(InboundOrder inboundOrder);
    void RemoveInboundOrderLines(IEnumerable<InboundOrderLine> lines);

    Task<IReadOnlyList<Receipt>> ListReceiptsAsync(CancellationToken cancellationToken);
    Task<Receipt?> FindReceiptByIdAsync(Guid receiptId, CancellationToken cancellationToken);
    void AddReceipt(Receipt receipt);

    Task<InventoryBalance?> FindInventoryBalanceAsync(
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken);
    void AddInventoryBalance(InventoryBalance balance);
    void AddInventoryMovement(InventoryMovement movement);

    Task<IInboundWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
