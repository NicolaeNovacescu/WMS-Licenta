using Wms.Domain.Catalog;
using Wms.Domain.WarehouseStructure;

namespace Wms.Domain.Replenishment;

public sealed class ReplenishmentRule
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid TargetLocationId { get; set; }
    public Location TargetLocation { get; set; } = null!;
    public decimal MinimumThreshold { get; set; }
    public decimal TargetQuantity { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
