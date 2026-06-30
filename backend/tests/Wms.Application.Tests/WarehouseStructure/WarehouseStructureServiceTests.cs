using Wms.Application.WarehouseStructure;
using Wms.Application.WarehouseStructure.Abstractions;
using Wms.Application.WarehouseStructure.Models;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.WarehouseStructure;

public sealed class WarehouseStructureServiceTests
{
    [Fact]
    public async Task UpdateWarehouseAsync_UpdatesFields()
    {
        var repository = new InMemoryWarehouseStructureRepository();
        var warehouse = repository.SeedWarehouse("MAIN", "Main Warehouse", true);
        var service = new WarehouseStructureService(repository);

        var result = await service.UpdateWarehouseAsync(
            warehouse.Id,
            new UpdateWarehouseCommand("overflow", "Overflow Warehouse", false),
            CancellationToken.None);

        Assert.Equal("overflow", result.Code);
        Assert.Equal("Overflow Warehouse", result.Name);
        Assert.False(result.IsActive);
        Assert.Equal("overflow", repository.Warehouses.Single().Code);
    }

    [Fact]
    public async Task UpdateWarehouseAsync_ThrowsWhenWarehouseIsMissing()
    {
        var service = new WarehouseStructureService(new InMemoryWarehouseStructureRepository());

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.UpdateWarehouseAsync(
                Guid.NewGuid(),
                new UpdateWarehouseCommand("MAIN", "Main Warehouse", true),
                CancellationToken.None));
    }

    [Fact]
    public async Task UpdateZoneAsync_UpdatesFieldsAndWarehouse()
    {
        var repository = new InMemoryWarehouseStructureRepository();
        var mainWarehouse = repository.SeedWarehouse("MAIN", "Main Warehouse", true);
        var overflowWarehouse = repository.SeedWarehouse("OVER", "Overflow Warehouse", true);
        var zone = repository.SeedZone(mainWarehouse, "PICK", "Picking", true);
        var service = new WarehouseStructureService(repository);

        var result = await service.UpdateZoneAsync(
            zone.Id,
            new UpdateZoneCommand(overflowWarehouse.Id, "stage", "Staging", false),
            CancellationToken.None);

        Assert.Equal(overflowWarehouse.Id, result.WarehouseId);
        Assert.Equal("OVER", result.WarehouseCode);
        Assert.Equal("stage", result.Code);
        Assert.Equal("Staging", result.Name);
        Assert.False(result.IsActive);
    }

    [Fact]
    public async Task UpdateZoneAsync_ThrowsWhenWarehouseIsMissing()
    {
        var repository = new InMemoryWarehouseStructureRepository();
        var warehouse = repository.SeedWarehouse("MAIN", "Main Warehouse", true);
        var zone = repository.SeedZone(warehouse, "PICK", "Picking", true);
        var service = new WarehouseStructureService(repository);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.UpdateZoneAsync(
                zone.Id,
                new UpdateZoneCommand(Guid.NewGuid(), "PICK", "Picking", true),
                CancellationToken.None));
    }

    private sealed class InMemoryWarehouseStructureRepository : IWarehouseStructureRepository
    {
        private readonly List<Warehouse> _warehouses = [];
        private readonly List<Zone> _zones = [];
        private readonly List<Location> _locations = [];

        public IReadOnlyList<Warehouse> Warehouses => _warehouses;

        public Task<IReadOnlyList<Warehouse>> ListWarehousesAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Warehouse>>(_warehouses.OrderBy(warehouse => warehouse.Name).ToArray());

        public Task<Warehouse?> FindWarehouseByIdAsync(Guid warehouseId, CancellationToken cancellationToken) =>
            Task.FromResult(_warehouses.SingleOrDefault(warehouse => warehouse.Id == warehouseId));

        public void AddWarehouse(Warehouse warehouse) => _warehouses.Add(warehouse);

        public Task<IReadOnlyList<Zone>> ListZonesAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Zone>>(_zones.OrderBy(zone => zone.Name).ToArray());

        public Task<Zone?> FindZoneByIdAsync(Guid zoneId, CancellationToken cancellationToken) =>
            Task.FromResult(_zones.SingleOrDefault(zone => zone.Id == zoneId));

        public void AddZone(Zone zone) => _zones.Add(zone);

        public Task<IReadOnlyList<Location>> ListLocationsAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Location>>(_locations.OrderBy(location => location.Code).ToArray());

        public Task<Location?> FindLocationByIdAsync(Guid locationId, CancellationToken cancellationToken) =>
            Task.FromResult(_locations.SingleOrDefault(location => location.Id == locationId));

        public Task<bool> LocationCodeExistsAsync(
            Guid warehouseId,
            string locationCode,
            Guid? excludingLocationId,
            CancellationToken cancellationToken) =>
            Task.FromResult(
                _locations.Any(location =>
                    location.WarehouseId == warehouseId &&
                    location.Code == locationCode &&
                    (!excludingLocationId.HasValue || location.Id != excludingLocationId.Value)));

        public void AddLocation(Location location) => _locations.Add(location);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public Warehouse SeedWarehouse(string code, string name, bool isActive)
        {
            var warehouse = new Warehouse
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = name,
                IsActive = isActive,
            };

            _warehouses.Add(warehouse);
            return warehouse;
        }

        public Zone SeedZone(Warehouse warehouse, string code, string name, bool isActive)
        {
            var zone = new Zone
            {
                Id = Guid.NewGuid(),
                WarehouseId = warehouse.Id,
                Warehouse = warehouse,
                Code = code,
                Name = name,
                IsActive = isActive,
            };

            _zones.Add(zone);
            return zone;
        }
    }
}
