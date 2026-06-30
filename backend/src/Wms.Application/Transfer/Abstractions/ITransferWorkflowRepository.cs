using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Transfer;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Transfer.Abstractions;

public interface ITransferWorkflowRepository
{
    Task<IReadOnlyList<TransferTask>> ListTransferTasksAsync(CancellationToken cancellationToken);
    Task<TransferTask?> FindTransferTaskByIdAsync(Guid transferTaskId, CancellationToken cancellationToken);
    Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken);
    Task<InventoryBalance?> FindInventoryBalanceAsync(
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken);
    void AddTransferTask(TransferTask transferTask);
    void AddInventoryBalance(InventoryBalance balance);
    void AddInventoryMovement(InventoryMovement movement);
    Task<ITransferWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
