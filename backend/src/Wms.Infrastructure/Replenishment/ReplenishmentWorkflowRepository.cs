using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.Replenishment.Abstractions;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Replenishment;
using Wms.Domain.WarehouseStructure;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Replenishment;

public sealed class ReplenishmentWorkflowRepository(WmsDbContext dbContext) : IReplenishmentWorkflowRepository
{
    public async Task<IReadOnlyList<ReplenishmentRule>> ListReplenishmentRulesAsync(CancellationToken cancellationToken) =>
        await ReplenishmentRulesQuery()
            .OrderByDescending(replenishmentRule => replenishmentRule.UpdatedAtUtc)
            .ThenBy(replenishmentRule => replenishmentRule.Id)
            .ToArrayAsync(cancellationToken);

    public Task<ReplenishmentRule?> FindReplenishmentRuleByIdAsync(
        Guid replenishmentRuleId,
        CancellationToken cancellationToken) =>
        ReplenishmentRulesQuery()
            .SingleOrDefaultAsync(replenishmentRule => replenishmentRule.Id == replenishmentRuleId, cancellationToken);

    public Task<ReplenishmentRule?> FindActiveReplenishmentRuleAsync(
        Guid productId,
        Guid targetLocationId,
        CancellationToken cancellationToken) =>
        dbContext.ReplenishmentRules
            .SingleOrDefaultAsync(
                replenishmentRule =>
                    replenishmentRule.IsActive &&
                    replenishmentRule.ProductId == productId &&
                    replenishmentRule.TargetLocationId == targetLocationId,
                cancellationToken);

    public Task<bool> HasConflictingActiveReplenishmentRuleAsync(
        Guid productId,
        Guid targetLocationId,
        Guid? excludedRuleId,
        CancellationToken cancellationToken) =>
        dbContext.ReplenishmentRules.AnyAsync(
            replenishmentRule =>
                replenishmentRule.IsActive &&
                replenishmentRule.ProductId == productId &&
                replenishmentRule.TargetLocationId == targetLocationId &&
                (!excludedRuleId.HasValue || replenishmentRule.Id != excludedRuleId.Value),
            cancellationToken);

    public async Task<IReadOnlyList<ReplenishmentTask>> ListReplenishmentTasksAsync(CancellationToken cancellationToken) =>
        await ReplenishmentTasksQuery()
            .OrderByDescending(replenishmentTask => replenishmentTask.CreatedAtUtc)
            .ThenBy(replenishmentTask => replenishmentTask.Id)
            .ToArrayAsync(cancellationToken);

    public Task<ReplenishmentTask?> FindReplenishmentTaskByIdAsync(
        Guid replenishmentTaskId,
        CancellationToken cancellationToken) =>
        ReplenishmentTasksQuery()
            .SingleOrDefaultAsync(replenishmentTask => replenishmentTask.Id == replenishmentTaskId, cancellationToken);

    public Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken) =>
        dbContext.Products
            .SingleOrDefaultAsync(product => product.Id == productId, cancellationToken);

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

    public Task<InventoryBalance?> FindInventoryBalanceAsync(
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken) =>
        dbContext.InventoryBalances
            .Include(balance => balance.Product)
            .Include(balance => balance.Location)
            .SingleOrDefaultAsync(
                balance => balance.ProductId == productId && balance.LocationId == locationId,
                cancellationToken);

    public void AddReplenishmentRule(ReplenishmentRule replenishmentRule) =>
        dbContext.ReplenishmentRules.Add(replenishmentRule);

    public void AddReplenishmentTask(ReplenishmentTask replenishmentTask) =>
        dbContext.ReplenishmentTasks.Add(replenishmentTask);

    public void AddInventoryBalance(InventoryBalance balance) => dbContext.InventoryBalances.Add(balance);

    public void AddInventoryMovement(InventoryMovement movement) => dbContext.InventoryMovements.Add(movement);

    public async Task<IReplenishmentWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfReplenishmentWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<ReplenishmentRule> ReplenishmentRulesQuery() =>
        dbContext.ReplenishmentRules
            .AsSplitQuery()
            .Include(replenishmentRule => replenishmentRule.Product)
            .Include(replenishmentRule => replenishmentRule.TargetLocation)
            .ThenInclude(location => location.Warehouse)
            .Include(replenishmentRule => replenishmentRule.TargetLocation)
            .ThenInclude(location => location.Zone);

    private IQueryable<ReplenishmentTask> ReplenishmentTasksQuery() =>
        dbContext.ReplenishmentTasks
            .AsSplitQuery()
            .Include(replenishmentTask => replenishmentTask.Product)
            .Include(replenishmentTask => replenishmentTask.SourceLocation)
            .ThenInclude(location => location.Warehouse)
            .Include(replenishmentTask => replenishmentTask.SourceLocation)
            .ThenInclude(location => location.Zone)
            .Include(replenishmentTask => replenishmentTask.TargetLocation)
            .ThenInclude(location => location.Warehouse)
            .Include(replenishmentTask => replenishmentTask.TargetLocation)
            .ThenInclude(location => location.Zone);

    private sealed class EfReplenishmentWorkflowTransaction(IDbContextTransaction transaction) : IReplenishmentWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
