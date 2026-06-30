using Wms.Domain.Catalog;
using Wms.Domain.WarehouseStructure;

namespace Wms.Domain.Replenishment;

public sealed class ReplenishmentTask
{
    public Guid Id { get; set; }
    public Guid ReplenishmentRuleId { get; set; }
    public ReplenishmentRule ReplenishmentRule { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid SourceLocationId { get; set; }
    public Location SourceLocation { get; set; } = null!;
    public Guid TargetLocationId { get; set; }
    public Location TargetLocation { get; set; } = null!;
    public decimal Quantity { get; set; }
    public string Status { get; set; } = ReplenishmentTaskStatus.Pending;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? StartedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public DateTimeOffset? CancelledAtUtc { get; set; }
}
