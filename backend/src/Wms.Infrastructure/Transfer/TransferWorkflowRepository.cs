using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.Transfer.Abstractions;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Transfer;
using Wms.Domain.WarehouseStructure;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Transfer;

public sealed class TransferWorkflowRepository(WmsDbContext dbContext) : ITransferWorkflowRepository
{
    public async Task<IReadOnlyList<TransferTask>> ListTransferTasksAsync(CancellationToken cancellationToken) =>
        await TransferTasksQuery()
            .OrderByDescending(transferTask => transferTask.CreatedAtUtc)
            .ThenBy(transferTask => transferTask.Id)
            .ToArrayAsync(cancellationToken);

    public Task<TransferTask?> FindTransferTaskByIdAsync(Guid transferTaskId, CancellationToken cancellationToken) =>
        TransferTasksQuery()
            .SingleOrDefaultAsync(transferTask => transferTask.Id == transferTaskId, cancellationToken);

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

    public void AddTransferTask(TransferTask transferTask) => dbContext.TransferTasks.Add(transferTask);

    public void AddInventoryBalance(InventoryBalance balance) => dbContext.InventoryBalances.Add(balance);

    public void AddInventoryMovement(InventoryMovement movement) => dbContext.InventoryMovements.Add(movement);

    public async Task<ITransferWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfTransferWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<TransferTask> TransferTasksQuery() =>
        dbContext.TransferTasks
            .AsSplitQuery()
            .Include(transferTask => transferTask.Product)
            .Include(transferTask => transferTask.SourceLocation)
            .ThenInclude(location => location.Warehouse)
            .Include(transferTask => transferTask.SourceLocation)
            .ThenInclude(location => location.Zone)
            .Include(transferTask => transferTask.DestinationLocation)
            .ThenInclude(location => location.Warehouse)
            .Include(transferTask => transferTask.DestinationLocation)
            .ThenInclude(location => location.Zone);

    private sealed class EfTransferWorkflowTransaction(IDbContextTransaction transaction) : ITransferWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
