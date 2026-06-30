using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Wms.Application.Sales.Abstractions;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using Wms.Domain.Shipment;
using Wms.Domain.WarehouseStructure;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Sales;

public sealed class SalesOrderWorkflowRepository(WmsDbContext dbContext) : ISalesOrderWorkflowRepository
{
    public async Task<IReadOnlyList<SalesOrder>> ListSalesOrdersAsync(CancellationToken cancellationToken) =>
        await SalesOrdersQuery()
            .OrderByDescending(salesOrder => salesOrder.UpdatedAtUtc)
            .ThenBy(salesOrder => salesOrder.Id)
            .ToArrayAsync(cancellationToken);

    public Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
        SalesOrdersQuery()
            .SingleOrDefaultAsync(salesOrder => salesOrder.Id == salesOrderId, cancellationToken);

    public Task<Customer?> FindCustomerByIdAsync(Guid customerId, CancellationToken cancellationToken) =>
        dbContext.Customers.SingleOrDefaultAsync(customer => customer.Id == customerId, cancellationToken);

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

    public async Task<IReadOnlyList<InventoryBalance>> ListEligibleReservationBalancesAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken)
    {
        if (productIds.Count == 0)
        {
            return [];
        }

        return await dbContext.InventoryBalances
            .Include(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(balance => balance.Location)
            .ThenInclude(location => location.Zone)
            .Where(balance =>
                productIds.Contains(balance.ProductId) &&
                balance.Location.IsActive &&
                !balance.Location.IsBlocked &&
                balance.Location.LocationType != LocationType.Receiving &&
                balance.OnHandQuantity > balance.ReservedQuantity + balance.PickedQuantity)
            .ToArrayAsync(cancellationToken);
    }

    public Task<bool> HasOpenPickingTasksAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
        dbContext.PickingTasks.AnyAsync(
            task =>
                task.SalesOrderId == salesOrderId &&
                (task.Status == PickingTaskStatus.Pending || task.Status == PickingTaskStatus.InProgress),
            cancellationToken);

    public Task<bool> HasPickingTaskLineReferencesAsync(
        IReadOnlyCollection<Guid> salesOrderReservationIds,
        CancellationToken cancellationToken)
    {
        if (salesOrderReservationIds.Count == 0)
        {
            return Task.FromResult(false);
        }

        return dbContext.PickingTaskLines.AnyAsync(
            line => salesOrderReservationIds.Contains(line.SalesOrderReservationId),
            cancellationToken);
    }

    public Task<bool> HasShipmentExecutionAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
        dbContext.Shipments.AnyAsync(
            shipment =>
                shipment.SalesOrderId == salesOrderId &&
                shipment.Status != ShipmentStatus.Cancelled,
            cancellationToken);

    public void AddSalesOrder(SalesOrder salesOrder) => dbContext.SalesOrders.Add(salesOrder);

    public void AddSalesOrderReservations(IEnumerable<SalesOrderReservation> salesOrderReservations) =>
        dbContext.SalesOrderReservations.AddRange(salesOrderReservations);

    public void RemoveSalesOrderLines(IEnumerable<SalesOrderLine> salesOrderLines) =>
        dbContext.SalesOrderLines.RemoveRange(salesOrderLines);

    public void RemoveSalesOrderReservations(IEnumerable<SalesOrderReservation> salesOrderReservations) =>
        dbContext.SalesOrderReservations.RemoveRange(salesOrderReservations);

    public async Task<ISalesOrderWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        return new EfSalesOrderWorkflowTransaction(transaction);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    private IQueryable<SalesOrder> SalesOrdersQuery() =>
        dbContext.SalesOrders
            .AsSplitQuery()
            .Include(salesOrder => salesOrder.Customer)
            .Include(salesOrder => salesOrder.Lines)
            .ThenInclude(line => line.Product)
            .Include(salesOrder => salesOrder.Lines)
            .ThenInclude(line => line.Reservations)
            .ThenInclude(reservation => reservation.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(salesOrder => salesOrder.Lines)
            .ThenInclude(line => line.Reservations)
            .ThenInclude(reservation => reservation.InventoryBalance)
            .ThenInclude(balance => balance.Location)
            .ThenInclude(location => location.Zone);

    private sealed class EfSalesOrderWorkflowTransaction(IDbContextTransaction transaction) : ISalesOrderWorkflowTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
