using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.WarehouseStructure;

namespace Wms.Domain.Putaway;

public sealed class PutawayTask
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid SourceLocationId { get; set; }
    public Location SourceLocation { get; set; } = null!;
    public Guid DestinationLocationId { get; set; }
    public Location DestinationLocation { get; set; } = null!;
    public Guid? ReceiptLineId { get; set; }
    public ReceiptLine? ReceiptLine { get; set; }
    public decimal Quantity { get; set; }
    public string Status { get; set; } = PutawayTaskStatus.Pending;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? StartedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public DateTimeOffset? CancelledAtUtc { get; set; }
}
