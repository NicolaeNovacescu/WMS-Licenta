namespace Wms.Domain.InventoryCount;

public sealed class InventoryCount
{
    public Guid Id { get; set; }
    public string Status { get; set; } = InventoryCountStatus.Draft;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? StartedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public DateTimeOffset? CancelledAtUtc { get; set; }
    public ICollection<InventoryCountLine> Lines { get; set; } = [];
}
