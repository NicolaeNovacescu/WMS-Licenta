using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using Wms.Domain.Putaway;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Putaway.Abstractions;

public interface IPutawayWorkflowRepository
{
    Task<IReadOnlyList<PutawayTask>> ListPutawayTasksAsync(CancellationToken cancellationToken);
    Task<PutawayTask?> FindPutawayTaskByIdAsync(Guid putawayTaskId, CancellationToken cancellationToken);
    Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken);
    Task<ReceiptLine?> FindReceiptLineByIdAsync(Guid receiptLineId, CancellationToken cancellationToken);
    Task<InventoryBalance?> FindInventoryBalanceAsync(
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken);
    void AddPutawayTask(PutawayTask putawayTask);
    void AddInventoryBalance(InventoryBalance balance);
    void AddInventoryMovement(InventoryMovement movement);
    Task<IPutawayWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
