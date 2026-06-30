using Wms.Domain.WarehouseStructure;

namespace Wms.Application.WarehouseStructure.Abstractions;

public interface IWarehouseStructureRepository
{
    Task<IReadOnlyList<Warehouse>> ListWarehousesAsync(CancellationToken cancellationToken);
    Task<Warehouse?> FindWarehouseByIdAsync(Guid warehouseId, CancellationToken cancellationToken);
    void AddWarehouse(Warehouse warehouse);
    Task<IReadOnlyList<Zone>> ListZonesAsync(CancellationToken cancellationToken);
    Task<Zone?> FindZoneByIdAsync(Guid zoneId, CancellationToken cancellationToken);
    void AddZone(Zone zone);
    Task<IReadOnlyList<Location>> ListLocationsAsync(CancellationToken cancellationToken);
    Task<Location?> FindLocationByIdAsync(Guid locationId, CancellationToken cancellationToken);
    Task<bool> LocationCodeExistsAsync(
        Guid warehouseId,
        string locationCode,
        Guid? excludingLocationId,
        CancellationToken cancellationToken);
    void AddLocation(Location location);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
