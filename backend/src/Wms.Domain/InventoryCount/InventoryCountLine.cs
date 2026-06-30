using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;

namespace Wms.Domain.InventoryCount;

public sealed class InventoryCountLine
{
    public Guid Id { get; set; }
    public Guid InventoryCountId { get; set; }
    public InventoryCount InventoryCount { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid LocationId { get; set; }
    public Location Location { get; set; } = null!;
    public Guid? InventoryBalanceId { get; set; }
    public InventoryBalance? InventoryBalance { get; set; }
    public decimal ExpectedSystemQuantity { get; set; }
    public decimal? CountedQuantity { get; set; }
    public decimal? VarianceQuantity { get; set; }
}
