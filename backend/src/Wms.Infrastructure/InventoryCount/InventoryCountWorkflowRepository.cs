using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.InventoryCount.Abstractions;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using InventoryCountEntity = Wms.Domain.InventoryCount.InventoryCount;
using Wms.Domain.WarehouseStructure;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.InventoryCount;

public sealed class InventoryCountWorkflowRepository(WmsDbContext dbContext) : IInventoryCountWorkflowRepository
{
    public async Task<IReadOnlyList<InventoryCountEntity>> ListInventoryCountsAsync(CancellationToken cancellationToken) =>
        await InventoryCountsQuery()
            .OrderByDescending(inventoryCount => inventoryCount.CreatedAtUtc)
            .ThenBy(inventoryCount => inventoryCount.Id)
            .ToArrayAsync(cancellationToken);

    public Task<InventoryCountEntity?> FindInventoryCountByIdAsync(Guid inventoryCountId, CancellationToken cancellationToken) =>
        InventoryCountsQuery()
            .SingleOrDefaultAsync(inventoryCount => inventoryCount.Id == inventoryCountId, cancellationToken);

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

    public async Task<IReadOnlyList<InventoryBalance>> ListInventoryBalancesByProductIdsAndLocationIdsAsync(
        IReadOnlyCollection<Guid> productIds,
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken)
    {
        if (productIds.Count == 0 || locationIds.Count == 0)
        {
            return [];
        }

        return await dbContext.InventoryBalances
            .Include(balance => balance.Product)
            .Include(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(balance => balance.Location)
            .ThenInclude(location => location.Zone)
            .Where(balance => productIds.Contains(balance.ProductId) && locationIds.Contains(balance.LocationId))
            .ToArrayAsync(cancellationToken);
    }

    public void AddInventoryCount(InventoryCountEntity inventoryCount) => dbContext.InventoryCounts.Add(inventoryCount);

    public void AddInventoryBalance(InventoryBalance inventoryBalance) => dbContext.InventoryBalances.Add(inventoryBalance);

    public void AddInventoryMovement(InventoryMovement inventoryMovement) => dbContext.InventoryMovements.Add(inventoryMovement);

    public async Task<IInventoryCountWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfInventoryCountWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<InventoryCountEntity> InventoryCountsQuery() =>
        dbContext.InventoryCounts
            .AsSplitQuery()
            .Include(inventoryCount => inventoryCount.Lines)
            .ThenInclude(line => line.Product)
            .Include(inventoryCount => inventoryCount.Lines)
            .ThenInclude(line => line.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(inventoryCount => inventoryCount.Lines)
            .ThenInclude(line => line.Location)
            .ThenInclude(location => location.Zone)
            .Include(inventoryCount => inventoryCount.Lines)
            .ThenInclude(line => line.InventoryBalance);

    private sealed class EfInventoryCountWorkflowTransaction(IDbContextTransaction transaction) : IInventoryCountWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
