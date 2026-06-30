using Wms.Domain.Catalog;
using Wms.Domain.WarehouseStructure;

namespace Wms.Domain.Inventory;

public sealed class InventoryBalance
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid LocationId { get; set; }
    public Location Location { get; set; } = null!;
    public decimal OnHandQuantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal PickedQuantity { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }

    // Picked stock remains on hand until shipment exists, so it is not available again.
    public decimal AvailableQuantity => OnHandQuantity - ReservedQuantity - PickedQuantity;
}
