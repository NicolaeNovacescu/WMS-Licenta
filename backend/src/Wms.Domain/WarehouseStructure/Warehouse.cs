namespace Wms.Domain.WarehouseStructure;

public sealed class Warehouse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    public ICollection<Zone> Zones { get; } = [];
    public ICollection<Location> Locations { get; } = [];
}
