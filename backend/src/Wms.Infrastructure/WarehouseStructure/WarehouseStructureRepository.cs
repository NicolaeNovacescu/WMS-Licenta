using Microsoft.EntityFrameworkCore;
using Wms.Application.WarehouseStructure.Abstractions;
using Wms.Domain.WarehouseStructure;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.WarehouseStructure;

public sealed class WarehouseStructureRepository(WmsDbContext dbContext) : IWarehouseStructureRepository
{
    public async Task<IReadOnlyList<Warehouse>> ListWarehousesAsync(CancellationToken cancellationToken) =>
        await dbContext.Warehouses
            .OrderBy(warehouse => warehouse.Name)
            .ToArrayAsync(cancellationToken);

    public Task<Warehouse?> FindWarehouseByIdAsync(Guid warehouseId, CancellationToken cancellationToken) =>
        dbContext.Warehouses
            .SingleOrDefaultAsync(warehouse => warehouse.Id == warehouseId, cancellationToken);

    public void AddWarehouse(Warehouse warehouse) => dbContext.Warehouses.Add(warehouse);

    public async Task<IReadOnlyList<Zone>> ListZonesAsync(CancellationToken cancellationToken) =>
        await dbContext.Zones
            .Include(zone => zone.Warehouse)
            .OrderBy(zone => zone.Warehouse.Name)
            .ThenBy(zone => zone.Name)
            .ToArrayAsync(cancellationToken);

    public Task<Zone?> FindZoneByIdAsync(Guid zoneId, CancellationToken cancellationToken) =>
        dbContext.Zones
            .Include(zone => zone.Warehouse)
            .SingleOrDefaultAsync(zone => zone.Id == zoneId, cancellationToken);

    public void AddZone(Zone zone) => dbContext.Zones.Add(zone);

    public async Task<IReadOnlyList<Location>> ListLocationsAsync(CancellationToken cancellationToken) =>
        await dbContext.Locations
            .Include(location => location.Warehouse)
            .Include(location => location.Zone)
            .OrderBy(location => location.Warehouse.Name)
            .ThenBy(location => location.Code)
            .ToArrayAsync(cancellationToken);

    public Task<Location?> FindLocationByIdAsync(Guid locationId, CancellationToken cancellationToken) =>
        dbContext.Locations
            .Include(location => location.Warehouse)
            .Include(location => location.Zone)
            .SingleOrDefaultAsync(location => location.Id == locationId, cancellationToken);

    public Task<bool> LocationCodeExistsAsync(
        Guid warehouseId,
        string locationCode,
        Guid? excludingLocationId,
        CancellationToken cancellationToken) =>
        dbContext.Locations.AnyAsync(
            location =>
                location.WarehouseId == warehouseId &&
                location.Code == locationCode &&
                (!excludingLocationId.HasValue || location.Id != excludingLocationId.Value),
            cancellationToken);

    public void AddLocation(Location location) => dbContext.Locations.Add(location);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
