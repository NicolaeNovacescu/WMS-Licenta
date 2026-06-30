using Wms.Domain.WarehouseStructure;

namespace Wms.Domain.Inbound;

public sealed class ReceiptLine
{
    public Guid Id { get; set; }
    public Guid ReceiptId { get; set; }
    public Receipt Receipt { get; set; } = null!;
    public Guid InboundOrderLineId { get; set; }
    public InboundOrderLine InboundOrderLine { get; set; } = null!;
    public Guid ReceivingLocationId { get; set; }
    public Location ReceivingLocation { get; set; } = null!;
    public decimal Quantity { get; set; }
}
