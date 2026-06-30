using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Sales;

namespace Wms.Application.Sales.Abstractions;

public interface ISalesOrderWorkflowRepository
{
    Task<IReadOnlyList<SalesOrder>> ListSalesOrdersAsync(CancellationToken cancellationToken);
    Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken);
    Task<Customer?> FindCustomerByIdAsync(Guid customerId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, Product>> FindProductsByIdsAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<InventoryBalance>> ListEligibleReservationBalancesAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken);
    Task<bool> HasOpenPickingTasksAsync(Guid salesOrderId, CancellationToken cancellationToken);
    Task<bool> HasPickingTaskLineReferencesAsync(
        IReadOnlyCollection<Guid> salesOrderReservationIds,
        CancellationToken cancellationToken);
    Task<bool> HasShipmentExecutionAsync(Guid salesOrderId, CancellationToken cancellationToken);
    void AddSalesOrder(SalesOrder salesOrder);
    void AddSalesOrderReservations(IEnumerable<SalesOrderReservation> salesOrderReservations);
    void RemoveSalesOrderLines(IEnumerable<SalesOrderLine> salesOrderLines);
    void RemoveSalesOrderReservations(IEnumerable<SalesOrderReservation> salesOrderReservations);
    Task<ISalesOrderWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
