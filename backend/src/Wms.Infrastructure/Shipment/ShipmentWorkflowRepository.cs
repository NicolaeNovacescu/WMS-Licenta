using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.Shipment.Abstractions;
using Wms.Domain.Inventory;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using ShipmentEntity = Wms.Domain.Shipment.Shipment;
using Wms.Domain.Shipment;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Shipment;

public sealed class ShipmentWorkflowRepository(WmsDbContext dbContext) : IShipmentWorkflowRepository
{
    public async Task<IReadOnlyList<ShipmentEntity>> ListShipmentsAsync(CancellationToken cancellationToken) =>
        await ShipmentsQuery()
            .OrderByDescending(shipment => shipment.CreatedAtUtc)
            .ThenBy(shipment => shipment.Id)
            .ToArrayAsync(cancellationToken);

    public Task<ShipmentEntity?> FindShipmentByIdAsync(Guid shipmentId, CancellationToken cancellationToken) =>
        ShipmentsQuery()
            .SingleOrDefaultAsync(shipment => shipment.Id == shipmentId, cancellationToken);

    public Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
        dbContext.SalesOrders
            .SingleOrDefaultAsync(order => order.Id == salesOrderId, cancellationToken);

    public async Task<IReadOnlyDictionary<Guid, PickingTaskLine>> FindPickingTaskLinesByIdsAsync(
        IReadOnlyCollection<Guid> pickingTaskLineIds,
        CancellationToken cancellationToken)
    {
        if (pickingTaskLineIds.Count == 0)
        {
            return new Dictionary<Guid, PickingTaskLine>();
        }

        return await dbContext.PickingTaskLines
            .AsSplitQuery()
            .Include(line => line.PickingTask)
            .ThenInclude(task => task.SalesOrder)
            .Include(line => line.SalesOrderLine)
            .ThenInclude(orderLine => orderLine.Product)
            .Include(line => line.SalesOrderReservation)
            .Include(line => line.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(line => line.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Zone)
            .Where(line => pickingTaskLineIds.Contains(line.Id))
            .ToDictionaryAsync(line => line.Id, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, decimal>> ListOpenAllocatedQuantitiesByPickingTaskLineIdsAsync(
        IReadOnlyCollection<Guid> pickingTaskLineIds,
        Guid? excludedShipmentId,
        CancellationToken cancellationToken)
    {
        if (pickingTaskLineIds.Count == 0)
        {
            return new Dictionary<Guid, decimal>();
        }

        return await dbContext.ShipmentLines
            .Where(line =>
                pickingTaskLineIds.Contains(line.PickingTaskLineId) &&
                line.Shipment.Status != ShipmentStatus.Completed &&
                line.Shipment.Status != ShipmentStatus.Cancelled &&
                (!excludedShipmentId.HasValue || line.ShipmentId != excludedShipmentId.Value))
            .GroupBy(line => line.PickingTaskLineId)
            .Select(group => new
            {
                PickingTaskLineId = group.Key,
                Quantity = group.Sum(line => line.QuantityToShip),
            })
            .ToDictionaryAsync(item => item.PickingTaskLineId, item => item.Quantity, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, decimal>> ListCompletedShippedQuantitiesByPickingTaskLineIdsAsync(
        IReadOnlyCollection<Guid> pickingTaskLineIds,
        Guid? excludedShipmentId,
        CancellationToken cancellationToken)
    {
        if (pickingTaskLineIds.Count == 0)
        {
            return new Dictionary<Guid, decimal>();
        }

        return await dbContext.ShipmentLines
            .Where(line =>
                pickingTaskLineIds.Contains(line.PickingTaskLineId) &&
                line.Shipment.Status == ShipmentStatus.Completed &&
                (!excludedShipmentId.HasValue || line.ShipmentId != excludedShipmentId.Value))
            .GroupBy(line => line.PickingTaskLineId)
            .Select(group => new
            {
                PickingTaskLineId = group.Key,
                Quantity = group.Sum(line => line.ShippedQuantity),
            })
            .ToDictionaryAsync(item => item.PickingTaskLineId, item => item.Quantity, cancellationToken);
    }

    public void AddShipment(ShipmentEntity shipment) => dbContext.Shipments.Add(shipment);

    public void AddInventoryMovement(InventoryMovement movement) => dbContext.InventoryMovements.Add(movement);

    public async Task<IShipmentWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfShipmentWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<ShipmentEntity> ShipmentsQuery() =>
        dbContext.Shipments
            .AsSplitQuery()
            .Include(shipment => shipment.SalesOrder)
            .Include(shipment => shipment.Lines)
            .ThenInclude(line => line.PickingTaskLine)
            .ThenInclude(pickingTaskLine => pickingTaskLine.PickingTask)
            .Include(shipment => shipment.Lines)
            .ThenInclude(line => line.PickingTaskLine)
            .ThenInclude(pickingTaskLine => pickingTaskLine.SalesOrderLine)
            .ThenInclude(orderLine => orderLine.Product)
            .Include(shipment => shipment.Lines)
            .ThenInclude(line => line.PickingTaskLine)
            .ThenInclude(pickingTaskLine => pickingTaskLine.SalesOrderReservation)
            .Include(shipment => shipment.Lines)
            .ThenInclude(line => line.PickingTaskLine)
            .ThenInclude(pickingTaskLine => pickingTaskLine.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(shipment => shipment.Lines)
            .ThenInclude(line => line.PickingTaskLine)
            .ThenInclude(pickingTaskLine => pickingTaskLine.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Zone);

    private sealed class EfShipmentWorkflowTransaction(IDbContextTransaction transaction) : IShipmentWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
