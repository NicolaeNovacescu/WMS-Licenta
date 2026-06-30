using Wms.Domain.Inventory;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using ShipmentEntity = Wms.Domain.Shipment.Shipment;

namespace Wms.Application.Shipment.Abstractions;

public interface IShipmentWorkflowRepository
{
    Task<IReadOnlyList<ShipmentEntity>> ListShipmentsAsync(CancellationToken cancellationToken);
    Task<ShipmentEntity?> FindShipmentByIdAsync(Guid shipmentId, CancellationToken cancellationToken);
    Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, PickingTaskLine>> FindPickingTaskLinesByIdsAsync(
        IReadOnlyCollection<Guid> pickingTaskLineIds,
        CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, decimal>> ListOpenAllocatedQuantitiesByPickingTaskLineIdsAsync(
        IReadOnlyCollection<Guid> pickingTaskLineIds,
        Guid? excludedShipmentId,
        CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, decimal>> ListCompletedShippedQuantitiesByPickingTaskLineIdsAsync(
        IReadOnlyCollection<Guid> pickingTaskLineIds,
        Guid? excludedShipmentId,
        CancellationToken cancellationToken);
    void AddShipment(ShipmentEntity shipment);
    void AddInventoryMovement(InventoryMovement movement);
    Task<IShipmentWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
