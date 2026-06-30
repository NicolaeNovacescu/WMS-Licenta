using Wms.Application.WarehouseStructure.Abstractions;
using Wms.Application.WarehouseStructure.Models;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.WarehouseStructure;

public sealed class WarehouseStructureService(IWarehouseStructureRepository repository)
{
    public async Task<IReadOnlyList<WarehouseDto>> ListWarehousesAsync(CancellationToken cancellationToken)
    {
        var warehouses = await repository.ListWarehousesAsync(cancellationToken);
        return warehouses
            .Select(warehouse => new WarehouseDto(
                warehouse.Id,
                warehouse.Code,
                warehouse.Name,
                warehouse.IsActive))
            .ToArray();
    }

    public async Task<WarehouseDto> CreateWarehouseAsync(
        CreateWarehouseCommand command,
        CancellationToken cancellationToken)
    {
        var warehouse = new Warehouse
        {
            Id = Guid.NewGuid(),
            Code = NormalizeRequired(command.Code, nameof(command.Code)),
            Name = NormalizeRequired(command.Name, nameof(command.Name)),
            IsActive = command.IsActive,
        };

        repository.AddWarehouse(warehouse);
        await repository.SaveChangesAsync(cancellationToken);

        return new WarehouseDto(warehouse.Id, warehouse.Code, warehouse.Name, warehouse.IsActive);
    }

    public async Task<WarehouseDto> UpdateWarehouseAsync(
        Guid warehouseId,
        UpdateWarehouseCommand command,
        CancellationToken cancellationToken)
    {
        var warehouse = await repository.FindWarehouseByIdAsync(warehouseId, cancellationToken)
            ?? throw new KeyNotFoundException($"Warehouse '{warehouseId}' was not found.");

        warehouse.Code = NormalizeRequired(command.Code, nameof(command.Code));
        warehouse.Name = NormalizeRequired(command.Name, nameof(command.Name));
        warehouse.IsActive = command.IsActive;

        await repository.SaveChangesAsync(cancellationToken);

        return new WarehouseDto(warehouse.Id, warehouse.Code, warehouse.Name, warehouse.IsActive);
    }

    public async Task<IReadOnlyList<ZoneDto>> ListZonesAsync(CancellationToken cancellationToken)
    {
        var zones = await repository.ListZonesAsync(cancellationToken);
        return zones
            .Select(MapZone)
            .ToArray();
    }

    public async Task<ZoneDto> CreateZoneAsync(
        CreateZoneCommand command,
        CancellationToken cancellationToken)
    {
        var warehouse = await repository.FindWarehouseByIdAsync(command.WarehouseId, cancellationToken)
            ?? throw new KeyNotFoundException($"Warehouse '{command.WarehouseId}' was not found.");

        var zone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = NormalizeRequired(command.Code, nameof(command.Code)),
            Name = NormalizeRequired(command.Name, nameof(command.Name)),
            IsActive = command.IsActive,
        };

        repository.AddZone(zone);
        await repository.SaveChangesAsync(cancellationToken);

        return MapZone(zone);
    }

    public async Task<ZoneDto> UpdateZoneAsync(
        Guid zoneId,
        UpdateZoneCommand command,
        CancellationToken cancellationToken)
    {
        var zone = await repository.FindZoneByIdAsync(zoneId, cancellationToken)
            ?? throw new KeyNotFoundException($"Zone '{zoneId}' was not found.");

        var warehouse = await repository.FindWarehouseByIdAsync(command.WarehouseId, cancellationToken)
            ?? throw new KeyNotFoundException($"Warehouse '{command.WarehouseId}' was not found.");

        zone.WarehouseId = warehouse.Id;
        zone.Warehouse = warehouse;
        zone.Code = NormalizeRequired(command.Code, nameof(command.Code));
        zone.Name = NormalizeRequired(command.Name, nameof(command.Name));
        zone.IsActive = command.IsActive;

        await repository.SaveChangesAsync(cancellationToken);

        return MapZone(zone);
    }

    public async Task<IReadOnlyList<LocationDto>> ListLocationsAsync(CancellationToken cancellationToken)
    {
        var locations = await repository.ListLocationsAsync(cancellationToken);
        return locations
            .Select(MapLocation)
            .ToArray();
    }

    public async Task<LocationDto?> GetLocationByIdAsync(Guid locationId, CancellationToken cancellationToken)
    {
        var location = await repository.FindLocationByIdAsync(locationId, cancellationToken);
        return location is null ? null : MapLocation(location);
    }

    public async Task<LocationDto> CreateLocationAsync(
        CreateLocationCommand command,
        CancellationToken cancellationToken)
    {
        ValidateCoordinates(command.MapRow, command.MapColumn);

        var warehouse = await repository.FindWarehouseByIdAsync(command.WarehouseId, cancellationToken)
            ?? throw new KeyNotFoundException($"Warehouse '{command.WarehouseId}' was not found.");

        var zone = await repository.FindZoneByIdAsync(command.ZoneId, cancellationToken)
            ?? throw new KeyNotFoundException($"Zone '{command.ZoneId}' was not found.");

        EnsureZoneBelongsToWarehouse(zone, warehouse.Id);

        var code = NormalizeRequired(command.Code, nameof(command.Code));
        if (await repository.LocationCodeExistsAsync(warehouse.Id, code, null, cancellationToken))
        {
            throw new InvalidOperationException(
                $"Location code '{code}' already exists in warehouse '{warehouse.Code}'.");
        }

        var location = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = zone.Id,
            Zone = zone,
            Code = code,
            Name = NormalizeRequired(command.Name, nameof(command.Name)),
            LocationType = NormalizeRequired(command.LocationType, nameof(command.LocationType)),
            IsActive = command.IsActive,
            IsBlocked = false,
            MapRow = command.MapRow,
            MapColumn = command.MapColumn,
        };

        repository.AddLocation(location);
        await repository.SaveChangesAsync(cancellationToken);

        return MapLocation(location);
    }

    public async Task<LocationDto> UpdateLocationAsync(
        Guid locationId,
        UpdateLocationCommand command,
        CancellationToken cancellationToken)
    {
        ValidateCoordinates(command.MapRow, command.MapColumn);

        var location = await repository.FindLocationByIdAsync(locationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Location '{locationId}' was not found.");

        var warehouse = await repository.FindWarehouseByIdAsync(command.WarehouseId, cancellationToken)
            ?? throw new KeyNotFoundException($"Warehouse '{command.WarehouseId}' was not found.");

        var zone = await repository.FindZoneByIdAsync(command.ZoneId, cancellationToken)
            ?? throw new KeyNotFoundException($"Zone '{command.ZoneId}' was not found.");

        EnsureZoneBelongsToWarehouse(zone, warehouse.Id);

        var code = NormalizeRequired(command.Code, nameof(command.Code));
        if (await repository.LocationCodeExistsAsync(warehouse.Id, code, location.Id, cancellationToken))
        {
            throw new InvalidOperationException(
                $"Location code '{code}' already exists in warehouse '{warehouse.Code}'.");
        }

        location.WarehouseId = warehouse.Id;
        location.Warehouse = warehouse;
        location.ZoneId = zone.Id;
        location.Zone = zone;
        location.Code = code;
        location.Name = NormalizeRequired(command.Name, nameof(command.Name));
        location.LocationType = NormalizeRequired(command.LocationType, nameof(command.LocationType));
        location.IsActive = command.IsActive;
        location.MapRow = command.MapRow;
        location.MapColumn = command.MapColumn;

        await repository.SaveChangesAsync(cancellationToken);

        return MapLocation(location);
    }

    public async Task<bool> BlockLocationAsync(Guid locationId, CancellationToken cancellationToken)
    {
        var location = await repository.FindLocationByIdAsync(locationId, cancellationToken);
        if (location is null)
        {
            return false;
        }

        location.IsBlocked = true;
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UnblockLocationAsync(Guid locationId, CancellationToken cancellationToken)
    {
        var location = await repository.FindLocationByIdAsync(locationId, cancellationToken);
        if (location is null)
        {
            return false;
        }

        location.IsBlocked = false;
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ZoneDto MapZone(Zone zone) =>
        new(
            zone.Id,
            zone.WarehouseId,
            zone.Warehouse.Code,
            zone.Code,
            zone.Name,
            zone.IsActive);

    private static LocationDto MapLocation(Location location) =>
        new(
            location.Id,
            location.WarehouseId,
            location.Warehouse.Code,
            location.ZoneId,
            location.Zone.Code,
            location.Code,
            location.Name,
            location.LocationType,
            location.IsActive,
            location.IsBlocked,
            location.MapRow,
            location.MapColumn);

    private static string NormalizeRequired(string? value, string parameterName)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("A value is required.", parameterName);
        }

        return normalized;
    }

    private static void ValidateCoordinates(int mapRow, int mapColumn)
    {
        if (mapRow < 0)
        {
            throw new ArgumentException("Map row must be zero or greater.", nameof(mapRow));
        }

        if (mapColumn < 0)
        {
            throw new ArgumentException("Map column must be zero or greater.", nameof(mapColumn));
        }
    }

    private static void EnsureZoneBelongsToWarehouse(Zone zone, Guid warehouseId)
    {
        if (zone.WarehouseId != warehouseId)
        {
            throw new InvalidOperationException("Zone does not belong to the selected warehouse.");
        }
    }
}
