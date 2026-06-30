using Wms.Application.Inventory;
using Wms.Application.Inventory.Abstractions;
using Wms.Application.Inventory.Models;
using Wms.Domain.Authentication;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.Inventory;

public sealed class InventoryMovementHistoryServiceTests
{
    [Fact]
    public async Task ListMovementsAsync_MapsNullableLocationsAndPerformer()
    {
        var service = new InventoryMovementHistoryService(
            new RecordingInventoryMovementHistoryRepository(
            [
                BuildMovement(
                    InventoryMovementType.Addition,
                    sourceLocation: null,
                    destinationLocation: BuildLocation("MAIN", "STAGE", "STAGE-B-01"),
                    performedByUser: null,
                    notes: "Illustrative addition")
            ]));

        var result = await service.ListMovementsAsync(
            productId: null,
            locationId: null,
            movementType: null,
            CancellationToken.None);

        Assert.Single(result);
        Assert.Null(result[0].SourceLocationId);
        Assert.Equal("MAIN", result[0].DestinationWarehouseCode);
        Assert.Null(result[0].PerformedByUserId);
        Assert.Equal("Illustrative addition", result[0].Notes);
    }

    [Fact]
    public async Task ListMovementsAsync_NormalizesMovementTypeAndForwardsFilters()
    {
        var repository = new RecordingInventoryMovementHistoryRepository([]);
        var service = new InventoryMovementHistoryService(repository);
        var productId = Guid.NewGuid();
        var locationId = Guid.NewGuid();

        await service.ListMovementsAsync(
            productId,
            locationId,
            " relocation ",
            CancellationToken.None);

        Assert.NotNull(repository.LastQuery);
        Assert.Equal(productId, repository.LastQuery!.ProductId);
        Assert.Equal(locationId, repository.LastQuery.LocationId);
        Assert.Equal(InventoryMovementType.Relocation, repository.LastQuery.MovementType);
    }

    [Fact]
    public async Task ListMovementsAsync_ThrowsForUnsupportedMovementType()
    {
        var service = new InventoryMovementHistoryService(
            new RecordingInventoryMovementHistoryRepository([]));

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            service.ListMovementsAsync(
                productId: null,
                locationId: null,
                movementType: "RECEIPT",
                CancellationToken.None));

        Assert.Equal("movementType", exception.ParamName);
    }

    private static InventoryMovement BuildMovement(
        string movementType,
        Location? sourceLocation,
        Location? destinationLocation,
        User? performedByUser,
        string notes)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = "FG-1000",
            Name = "Demo Finished Product",
            Barcode = "FG-1000-BARCODE",
            Description = "Demo Finished Product",
            ImageUrl = string.Empty,
            IsActive = true,
        };

        return new InventoryMovement
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Product = product,
            Quantity = 8m,
            MovementType = movementType,
            SourceLocationId = sourceLocation?.Id,
            SourceLocation = sourceLocation,
            DestinationLocationId = destinationLocation?.Id,
            DestinationLocation = destinationLocation,
            ReferenceType = "DEMO",
            ReferenceId = "seed-movement-test",
            PerformedAtUtc = new DateTimeOffset(2026, 3, 14, 12, 0, 0, TimeSpan.Zero),
            PerformedByUserId = performedByUser?.Id,
            PerformedByUser = performedByUser,
            Notes = notes,
        };
    }

    private static Location BuildLocation(string warehouseCode, string zoneCode, string locationCode)
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
            LocationType = LocationType.Staging,
            IsActive = true,
            IsBlocked = false,
            MapRow = 1,
            MapColumn = 1,
        };
    }

    private sealed class RecordingInventoryMovementHistoryRepository(
        IReadOnlyList<InventoryMovement> movements) : IInventoryMovementHistoryRepository
    {
        public InventoryMovementQuery? LastQuery { get; private set; }

        public Task<IReadOnlyList<InventoryMovement>> ListMovementsAsync(
            InventoryMovementQuery query,
            CancellationToken cancellationToken)
        {
            LastQuery = query;
            return Task.FromResult(movements);
        }
    }
}
