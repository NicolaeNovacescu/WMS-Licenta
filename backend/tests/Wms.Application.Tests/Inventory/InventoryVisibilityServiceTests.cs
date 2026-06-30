using Wms.Application.Inventory;
using Wms.Application.Inventory.Abstractions;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.Inventory;

public sealed class InventoryVisibilityServiceTests
{
    [Fact]
    public async Task ListBalancesAsync_MapsDerivedAvailableQuantity()
    {
        var service = new InventoryVisibilityService(
            new InMemoryInventoryVisibilityRepository([BuildBalance(
                "FG-1000",
                "Demo Finished Product",
                "MAIN",
                "PICK",
                "PICK-A-01",
                true,
                false,
                24m,
                6m,
                4m)]));

        var balances = await service.ListBalancesAsync(CancellationToken.None);

        Assert.Single(balances);
        Assert.Equal(14m, balances[0].AvailableQuantity);
        Assert.Equal(4m, balances[0].PickedQuantity);
    }

    [Fact]
    public async Task ListByProductAsync_AggregatesBalanceQuantitiesAcrossLocations()
    {
        var product = BuildProduct("FG-1000", "Demo Finished Product");
        var pickingLocation = BuildLocation("MAIN", "PICK", "PICK-A-01", true, false);
        var stagingLocation = BuildLocation("MAIN", "STAGE", "STAGE-B-01", true, true);

        var balances = new[]
        {
            BuildBalance(product, pickingLocation, 24m, 6m, 2m),
            BuildBalance(product, stagingLocation, 8m, 0m, 0m),
        };

        var service = new InventoryVisibilityService(new InMemoryInventoryVisibilityRepository(balances));

        var byProduct = await service.ListByProductAsync(CancellationToken.None);

        Assert.Single(byProduct);
        Assert.Equal(32m, byProduct[0].OnHandQuantity);
        Assert.Equal(6m, byProduct[0].ReservedQuantity);
        Assert.Equal(2m, byProduct[0].PickedQuantity);
        Assert.Equal(24m, byProduct[0].AvailableQuantity);
    }

    [Fact]
    public async Task ListByLocationAsync_PreservesLocationStateAndAggregatesAcrossProducts()
    {
        var blockedLocation = BuildLocation("MAIN", "STAGE", "STAGE-B-01", true, true);
        var balances = new[]
        {
            BuildBalance(BuildProduct("FG-1000", "Demo Finished Product"), blockedLocation, 8m, 0m, 1m),
            BuildBalance(BuildProduct("RM-2000", "Demo Raw Material"), blockedLocation, 12m, 2m, 0m),
        };

        var service = new InventoryVisibilityService(new InMemoryInventoryVisibilityRepository(balances));

        var byLocation = await service.ListByLocationAsync(CancellationToken.None);

        Assert.Single(byLocation);
        Assert.True(byLocation[0].LocationIsActive);
        Assert.True(byLocation[0].LocationIsBlocked);
        Assert.Equal(20m, byLocation[0].OnHandQuantity);
        Assert.Equal(2m, byLocation[0].ReservedQuantity);
        Assert.Equal(1m, byLocation[0].PickedQuantity);
        Assert.Equal(17m, byLocation[0].AvailableQuantity);
    }

    private static Product BuildProduct(string sku, string productName) =>
        new()
        {
            Id = Guid.NewGuid(),
            Sku = sku,
            Name = productName,
            Barcode = $"{sku}-BARCODE",
            Description = productName,
            ImageUrl = string.Empty,
            IsActive = true,
        };

    private static Location BuildLocation(
        string warehouseCode,
        string zoneCode,
        string locationCode,
        bool isActive,
        bool isBlocked)
    {
        var warehouse = new Warehouse
        {
            Id = Guid.NewGuid(),
            Code = warehouseCode,
            Name = warehouseCode,
            IsActive = true,
        };

        var zone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = zoneCode,
            Name = zoneCode,
            IsActive = true,
        };

        return new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = zone.Id,
            Zone = zone,
            Code = locationCode,
            Name = locationCode,
            LocationType = LocationType.Picking,
            IsActive = isActive,
            IsBlocked = isBlocked,
            MapRow = 1,
            MapColumn = 1,
        };
    }

    private static InventoryBalance BuildBalance(
        string sku,
        string productName,
        string warehouseCode,
        string zoneCode,
        string locationCode,
        bool isActive,
        bool isBlocked,
        decimal onHandQuantity,
        decimal reservedQuantity,
        decimal pickedQuantity) =>
        BuildBalance(
            BuildProduct(sku, productName),
            BuildLocation(warehouseCode, zoneCode, locationCode, isActive, isBlocked),
            onHandQuantity,
            reservedQuantity,
            pickedQuantity);

    private static InventoryBalance BuildBalance(
        Product product,
        Location location,
        decimal onHandQuantity,
        decimal reservedQuantity,
        decimal pickedQuantity)
    {
        return new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Product = product,
            LocationId = location.Id,
            Location = location,
            OnHandQuantity = onHandQuantity,
            ReservedQuantity = reservedQuantity,
            PickedQuantity = pickedQuantity,
            UpdatedAtUtc = new DateTimeOffset(2026, 3, 14, 12, 0, 0, TimeSpan.Zero),
        };
    }

    private sealed class InMemoryInventoryVisibilityRepository(
        IReadOnlyList<InventoryBalance> balances) : IInventoryVisibilityRepository
    {
        public Task<IReadOnlyList<InventoryBalance>> ListBalancesAsync(CancellationToken cancellationToken) =>
            Task.FromResult(balances);
    }
}
