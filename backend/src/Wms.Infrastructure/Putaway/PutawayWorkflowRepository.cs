using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.Putaway.Abstractions;
using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using Wms.Domain.Putaway;
using Wms.Domain.WarehouseStructure;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Putaway;

public sealed class PutawayWorkflowRepository(WmsDbContext dbContext) : IPutawayWorkflowRepository
{
    public async Task<IReadOnlyList<PutawayTask>> ListPutawayTasksAsync(CancellationToken cancellationToken) =>
        await PutawayTasksQuery()
            .OrderByDescending(putawayTask => putawayTask.CreatedAtUtc)
            .ThenBy(putawayTask => putawayTask.Id)
            .ToArrayAsync(cancellationToken);

    public Task<PutawayTask?> FindPutawayTaskByIdAsync(Guid putawayTaskId, CancellationToken cancellationToken) =>
        PutawayTasksQuery()
            .SingleOrDefaultAsync(putawayTask => putawayTask.Id == putawayTaskId, cancellationToken);

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

    public Task<ReceiptLine?> FindReceiptLineByIdAsync(Guid receiptLineId, CancellationToken cancellationToken) =>
        dbContext.ReceiptLines
            .Include(receiptLine => receiptLine.Receipt)
            .Include(receiptLine => receiptLine.InboundOrderLine)
            .ThenInclude(inboundOrderLine => inboundOrderLine.Product)
            .Include(receiptLine => receiptLine.ReceivingLocation)
            .SingleOrDefaultAsync(receiptLine => receiptLine.Id == receiptLineId, cancellationToken);

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

    public void AddPutawayTask(PutawayTask putawayTask) => dbContext.PutawayTasks.Add(putawayTask);

    public void AddInventoryBalance(InventoryBalance balance) => dbContext.InventoryBalances.Add(balance);

    public void AddInventoryMovement(InventoryMovement movement) => dbContext.InventoryMovements.Add(movement);

    public async Task<IPutawayWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfPutawayWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<PutawayTask> PutawayTasksQuery() =>
        dbContext.PutawayTasks
            .AsSplitQuery()
            .Include(putawayTask => putawayTask.Product)
            .Include(putawayTask => putawayTask.SourceLocation)
            .ThenInclude(location => location.Warehouse)
            .Include(putawayTask => putawayTask.SourceLocation)
            .ThenInclude(location => location.Zone)
            .Include(putawayTask => putawayTask.DestinationLocation)
            .ThenInclude(location => location.Warehouse)
            .Include(putawayTask => putawayTask.DestinationLocation)
            .ThenInclude(location => location.Zone)
            .Include(putawayTask => putawayTask.ReceiptLine)
            .ThenInclude(receiptLine => receiptLine!.Receipt);

    private sealed class EfPutawayWorkflowTransaction(IDbContextTransaction transaction) : IPutawayWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
