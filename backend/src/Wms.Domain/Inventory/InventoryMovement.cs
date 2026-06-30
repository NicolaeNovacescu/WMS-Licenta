using Wms.Domain.Authentication;
using Wms.Domain.Catalog;
using Wms.Domain.WarehouseStructure;

namespace Wms.Domain.Inventory;

public sealed class InventoryMovement
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal Quantity { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public Guid? SourceLocationId { get; set; }
    public Location? SourceLocation { get; set; }
    public Guid? DestinationLocationId { get; set; }
    public Location? DestinationLocation { get; set; }
    public string? ReferenceType { get; set; }
    public string? ReferenceId { get; set; }
    public DateTimeOffset PerformedAtUtc { get; set; }
    public Guid? PerformedByUserId { get; set; }
    public User? PerformedByUser { get; set; }
    public string? Notes { get; set; }
}
