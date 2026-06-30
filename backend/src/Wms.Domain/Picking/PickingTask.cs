using Wms.Domain.Sales;

namespace Wms.Domain.Picking;

public sealed class PickingTask
{
    public Guid Id { get; set; }
    public Guid SalesOrderId { get; set; }
    public SalesOrder SalesOrder { get; set; } = null!;
    public string Status { get; set; } = PickingTaskStatus.Pending;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? StartedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public DateTimeOffset? CancelledAtUtc { get; set; }
    public ICollection<PickingTaskLine> Lines { get; set; } = [];
}
