using Wms.Domain.Inventory;

namespace Wms.Domain.Catalog;

public sealed class Product
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public ProductCategory Category { get; set; } = null!;
    public Guid UnitOfMeasureId { get; set; }
    public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public decimal DefaultMinPickingThreshold { get; set; }
    public decimal DefaultTargetPickingQuantity { get; set; }

    public ICollection<InventoryBalance> InventoryBalances { get; } = [];
}
