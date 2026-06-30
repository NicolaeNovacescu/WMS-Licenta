namespace Wms.Domain.WarehouseStructure;

public sealed class Zone
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    public ICollection<Location> Locations { get; } = [];
}
