using Wms.Domain.Inventory;
using Wms.Domain.Sales;

namespace Wms.Domain.Picking;

public sealed class PickingTaskLine
{
    public Guid Id { get; set; }
    public Guid PickingTaskId { get; set; }
    public PickingTask PickingTask { get; set; } = null!;
    public Guid SalesOrderLineId { get; set; }
    public SalesOrderLine SalesOrderLine { get; set; } = null!;
    public Guid SalesOrderReservationId { get; set; }
    public SalesOrderReservation SalesOrderReservation { get; set; } = null!;
    public Guid InventoryBalanceId { get; set; }
    public InventoryBalance InventoryBalance { get; set; } = null!;
    public decimal QuantityToPick { get; set; }
    public decimal PickedQuantity { get; set; }
}
