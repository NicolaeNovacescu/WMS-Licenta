namespace Wms.Domain.Inbound;

public sealed class InboundOrder
{
    public Guid Id { get; set; }
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public string SupplierInvoiceReference { get; set; } = string.Empty;
    public string Status { get; set; } = InboundOrderStatus.Draft;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public DateTimeOffset? CancelledAtUtc { get; set; }
    public ICollection<InboundOrderLine> Lines { get; set; } = [];
    public ICollection<Receipt> Receipts { get; set; } = [];
}
