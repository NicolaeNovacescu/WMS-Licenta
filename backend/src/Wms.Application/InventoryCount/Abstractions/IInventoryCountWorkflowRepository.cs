using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using InventoryCountEntity = Wms.Domain.InventoryCount.InventoryCount;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.InventoryCount.Abstractions;

public interface IInventoryCountWorkflowRepository
{
    Task<IReadOnlyList<InventoryCountEntity>> ListInventoryCountsAsync(CancellationToken cancellationToken);
    Task<InventoryCountEntity?> FindInventoryCountByIdAsync(Guid inventoryCountId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Product>> FindProductsByIdsAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<InventoryBalance>> ListInventoryBalancesByProductIdsAndLocationIdsAsync(
        IReadOnlyCollection<Guid> productIds,
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken);
    void AddInventoryCount(InventoryCountEntity inventoryCount);
    void AddInventoryBalance(InventoryBalance inventoryBalance);
    void AddInventoryMovement(InventoryMovement inventoryMovement);
    Task<IInventoryCountWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
