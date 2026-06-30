using Wms.Domain.Catalog;

namespace Wms.Domain.Inbound;

public sealed class InboundOrderLine
{
    public Guid Id { get; set; }
    public Guid InboundOrderId { get; set; }
    public InboundOrder InboundOrder { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal ExpectedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public ICollection<ReceiptLine> ReceiptLines { get; set; } = [];
}
