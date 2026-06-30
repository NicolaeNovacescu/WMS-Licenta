using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.Picking.Abstractions;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Picking;

public sealed class PickingWorkflowRepository(WmsDbContext dbContext) : IPickingWorkflowRepository
{
    public async Task<IReadOnlyList<PickingTask>> ListPickingTasksAsync(CancellationToken cancellationToken) =>
        await PickingTasksQuery()
            .OrderByDescending(task => task.CreatedAtUtc)
            .ThenBy(task => task.Id)
            .ToArrayAsync(cancellationToken);

    public Task<PickingTask?> FindPickingTaskByIdAsync(Guid pickingTaskId, CancellationToken cancellationToken) =>
        PickingTasksQuery()
            .SingleOrDefaultAsync(task => task.Id == pickingTaskId, cancellationToken);

    public Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
        dbContext.SalesOrders
            .AsSplitQuery()
            .Include(order => order.Lines)
            .ThenInclude(line => line.Product)
            .Include(order => order.Lines)
            .ThenInclude(line => line.Reservations)
            .ThenInclude(reservation => reservation.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(order => order.Lines)
            .ThenInclude(line => line.Reservations)
            .ThenInclude(reservation => reservation.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Zone)
            .SingleOrDefaultAsync(order => order.Id == salesOrderId, cancellationToken);

    public async Task<IReadOnlyDictionary<Guid, decimal>> ListOpenAllocatedQuantitiesByReservationIdsAsync(
        IReadOnlyCollection<Guid> reservationIds,
        Guid? excludedPickingTaskId,
        CancellationToken cancellationToken)
    {
        if (reservationIds.Count == 0)
        {
            return new Dictionary<Guid, decimal>();
        }

        return await dbContext.PickingTaskLines
            .Where(line =>
                reservationIds.Contains(line.SalesOrderReservationId) &&
                line.PickingTask.Status != PickingTaskStatus.Completed &&
                line.PickingTask.Status != PickingTaskStatus.Cancelled &&
                (!excludedPickingTaskId.HasValue || line.PickingTaskId != excludedPickingTaskId.Value))
            .GroupBy(line => line.SalesOrderReservationId)
            .Select(group => new
            {
                ReservationId = group.Key,
                Quantity = group.Sum(line => line.QuantityToPick),
            })
            .ToDictionaryAsync(item => item.ReservationId, item => item.Quantity, cancellationToken);
    }

    public void AddPickingTask(PickingTask pickingTask) => dbContext.PickingTasks.Add(pickingTask);

    public async Task<IPickingWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfPickingWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<PickingTask> PickingTasksQuery() =>
        dbContext.PickingTasks
            .AsSplitQuery()
            .Include(task => task.SalesOrder)
            .ThenInclude(order => order.Lines)
            .ThenInclude(line => line.Reservations)
            .Include(task => task.Lines)
            .ThenInclude(line => line.SalesOrderLine)
            .ThenInclude(orderLine => orderLine.Product)
            .Include(task => task.Lines)
            .ThenInclude(line => line.SalesOrderReservation)
            .ThenInclude(reservation => reservation.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(task => task.Lines)
            .ThenInclude(line => line.SalesOrderReservation)
            .ThenInclude(reservation => reservation.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Zone)
            .Include(task => task.Lines)
            .ThenInclude(line => line.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(task => task.Lines)
            .ThenInclude(line => line.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Zone);

    private sealed class EfPickingWorkflowTransaction(IDbContextTransaction transaction) : IPickingWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
