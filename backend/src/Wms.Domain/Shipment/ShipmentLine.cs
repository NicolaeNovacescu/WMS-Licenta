using Wms.Domain.Picking;

namespace Wms.Domain.Shipment;

public sealed class ShipmentLine
{
    public Guid Id { get; set; }
    public Guid ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;
    public Guid PickingTaskLineId { get; set; }
    public PickingTaskLine PickingTaskLine { get; set; } = null!;
    public decimal QuantityToShip { get; set; }
    public decimal ShippedQuantity { get; set; }
}
