namespace Wms.Domain.Inbound;

public sealed class Receipt
{
    public Guid Id { get; set; }
    public Guid InboundOrderId { get; set; }
    public InboundOrder InboundOrder { get; set; } = null!;
    public string Status { get; set; } = ReceiptStatus.Draft;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? StartedAtUtc { get; set; }
    public DateTimeOffset? ConfirmedAtUtc { get; set; }
    public DateTimeOffset? CancelledAtUtc { get; set; }
    public ICollection<ReceiptLine> Lines { get; set; } = [];
}
