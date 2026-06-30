using Wms.Domain.Inventory;

namespace Wms.Domain.WarehouseStructure;

public sealed class Location
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public Guid ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LocationType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsBlocked { get; set; }
    public int MapRow { get; set; }
    public int MapColumn { get; set; }

    public ICollection<InventoryBalance> InventoryBalances { get; } = [];
}
