using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Replenishment;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Replenishment.Abstractions;

public interface IReplenishmentWorkflowRepository
{
    Task<IReadOnlyList<ReplenishmentRule>> ListReplenishmentRulesAsync(CancellationToken cancellationToken);
    Task<ReplenishmentRule?> FindReplenishmentRuleByIdAsync(Guid replenishmentRuleId, CancellationToken cancellationToken);
    Task<ReplenishmentRule?> FindActiveReplenishmentRuleAsync(
        Guid productId,
        Guid targetLocationId,
        CancellationToken cancellationToken);
    Task<bool> HasConflictingActiveReplenishmentRuleAsync(
        Guid productId,
        Guid targetLocationId,
        Guid? excludedRuleId,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<ReplenishmentTask>> ListReplenishmentTasksAsync(CancellationToken cancellationToken);
    Task<ReplenishmentTask?> FindReplenishmentTaskByIdAsync(Guid replenishmentTaskId, CancellationToken cancellationToken);
    Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken);
    Task<InventoryBalance?> FindInventoryBalanceAsync(
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken);
    void AddReplenishmentRule(ReplenishmentRule replenishmentRule);
    void AddReplenishmentTask(ReplenishmentTask replenishmentTask);
    void AddInventoryBalance(InventoryBalance balance);
    void AddInventoryMovement(InventoryMovement movement);
    Task<IReplenishmentWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
