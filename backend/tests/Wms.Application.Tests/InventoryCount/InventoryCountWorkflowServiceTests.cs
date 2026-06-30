using Wms.Application.InventoryCount;
using Wms.Application.InventoryCount.Abstractions;
using Wms.Application.InventoryCount.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using InventoryCountEntity = Wms.Domain.InventoryCount.InventoryCount;
using InventoryCountLineEntity = Wms.Domain.InventoryCount.InventoryCountLine;
using Wms.Domain.InventoryCount;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.InventoryCount;

public sealed class InventoryCountWorkflowServiceTests
{
    [Fact]
    public async Task CreateInventoryCountAsync_SnapshotsExpectedQuantityAndDoesNotChangeStock()
    {
        var fixture = BuildFixture();
        var balance = CreateBalance(fixture.Product, fixture.PrimaryLocation, 10m, reservedQuantity: 2m, pickedQuantity: 1m);
        fixture.Repository.InventoryBalances.Add(balance);
        var service = new InventoryCountWorkflowService(fixture.Repository);

        var inventoryCount = await service.CreateInventoryCountAsync(
            new CreateInventoryCountCommand(
                [new CreateInventoryCountLineCommand(fixture.Product.Id, fixture.PrimaryLocation.Id)]),
            CancellationToken.None);

        Assert.Equal(InventoryCountStatus.Draft, inventoryCount.Status);
        Assert.Single(inventoryCount.Lines);
        Assert.Equal(balance.Id, inventoryCount.Lines[0].InventoryBalanceId);
        Assert.Equal(10m, inventoryCount.Lines[0].ExpectedSystemQuantity);
        Assert.Null(inventoryCount.Lines[0].CountedQuantity);
        Assert.Null(inventoryCount.Lines[0].VarianceQuantity);
        Assert.Single(fixture.Repository.InventoryBalances);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task StartInventoryCountAsync_TransitionsDraftToInProgress()
    {
        var fixture = BuildFixture();
        fixture.Repository.InventoryBalances.Add(CreateBalance(fixture.Product, fixture.PrimaryLocation, 4m));
        var service = new InventoryCountWorkflowService(fixture.Repository);
        var inventoryCount = await service.CreateInventoryCountAsync(
            new CreateInventoryCountCommand(
                [new CreateInventoryCountLineCommand(fixture.Product.Id, fixture.PrimaryLocation.Id)]),
            CancellationToken.None);

        var startedCount = await service.StartInventoryCountAsync(inventoryCount.Id, CancellationToken.None);

        Assert.Equal(InventoryCountStatus.InProgress, startedCount.Status);
        Assert.NotNull(startedCount.StartedAtUtc);
    }

    [Fact]
    public async Task CompleteInventoryCountAsync_WithPositiveVariance_UpdatesOnHandAndCreatesAdditionMovement()
    {
        var fixture = BuildFixture();
        var balance = CreateBalance(fixture.Product, fixture.PrimaryLocation, 10m, reservedQuantity: 1m, pickedQuantity: 1m);
        fixture.Repository.InventoryBalances.Add(balance);
        var service = new InventoryCountWorkflowService(fixture.Repository);
        var startedCount = await CreateAndStartCountAsync(service, fixture.Product.Id, fixture.PrimaryLocation.Id);

        var completedCount = await service.CompleteInventoryCountAsync(
            startedCount.Id,
            new CompleteInventoryCountCommand(
                [new CompleteInventoryCountLineCommand(startedCount.Lines[0].Id, 12m)]),
            Guid.NewGuid(),
            CancellationToken.None);

        Assert.Equal(InventoryCountStatus.Completed, completedCount.Status);
        Assert.Equal(12m, balance.OnHandQuantity);
        Assert.Equal(1m, balance.ReservedQuantity);
        Assert.Equal(1m, balance.PickedQuantity);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Addition, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.Equal("InventoryCount", fixture.Repository.InventoryMovements[0].ReferenceType);
        Assert.True(fixture.Repository.Transaction.Committed);
        Assert.Equal(12m, completedCount.Lines[0].CountedQuantity);
        Assert.Equal(2m, completedCount.Lines[0].VarianceQuantity);
    }

    [Fact]
    public async Task CompleteInventoryCountAsync_WithNegativeVariance_UpdatesOnHandAndCreatesRemovalMovement()
    {
        var fixture = BuildFixture();
        var balance = CreateBalance(fixture.Product, fixture.PrimaryLocation, 10m, reservedQuantity: 2m, pickedQuantity: 1m);
        fixture.Repository.InventoryBalances.Add(balance);
        var service = new InventoryCountWorkflowService(fixture.Repository);
        var startedCount = await CreateAndStartCountAsync(service, fixture.Product.Id, fixture.PrimaryLocation.Id);

        var completedCount = await service.CompleteInventoryCountAsync(
            startedCount.Id,
            new CompleteInventoryCountCommand(
                [new CompleteInventoryCountLineCommand(startedCount.Lines[0].Id, 8m)]),
            Guid.NewGuid(),
            CancellationToken.None);

        Assert.Equal(InventoryCountStatus.Completed, completedCount.Status);
        Assert.Equal(8m, balance.OnHandQuantity);
        Assert.Equal(2m, balance.ReservedQuantity);
        Assert.Equal(1m, balance.PickedQuantity);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Removal, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.Equal(2m, fixture.Repository.InventoryMovements[0].Quantity);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CompleteInventoryCountAsync_WhenNoBalanceExistsAndStockIsFound_CreatesBalanceAndAdditionMovement()
    {
        var fixture = BuildFixture();
        var service = new InventoryCountWorkflowService(fixture.Repository);
        var startedCount = await CreateAndStartCountAsync(service, fixture.Product.Id, fixture.SecondaryLocation.Id);

        var completedCount = await service.CompleteInventoryCountAsync(
            startedCount.Id,
            new CompleteInventoryCountCommand(
                [new CompleteInventoryCountLineCommand(startedCount.Lines[0].Id, 5m)]),
            Guid.NewGuid(),
            CancellationToken.None);

        var createdBalance = Assert.Single(
            fixture.Repository.InventoryBalances,
            inventoryBalance => inventoryBalance.LocationId == fixture.SecondaryLocation.Id);
        Assert.Equal(5m, createdBalance.OnHandQuantity);
        Assert.Equal(createdBalance.Id, completedCount.Lines[0].InventoryBalanceId);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Addition, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CompleteInventoryCountAsync_RejectsWhenResultingOnHandWouldBeBelowCommittedQuantity()
    {
        var fixture = BuildFixture();
        var balance = CreateBalance(fixture.Product, fixture.PrimaryLocation, 10m, reservedQuantity: 4m, pickedQuantity: 2m);
        fixture.Repository.InventoryBalances.Add(balance);
        var service = new InventoryCountWorkflowService(fixture.Repository);
        var startedCount = await CreateAndStartCountAsync(service, fixture.Product.Id, fixture.PrimaryLocation.Id);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CompleteInventoryCountAsync(
                startedCount.Id,
                new CompleteInventoryCountCommand(
                    [new CompleteInventoryCountLineCommand(startedCount.Lines[0].Id, 5m)]),
                Guid.NewGuid(),
                CancellationToken.None));

        Assert.Contains("below the currently reserved and picked quantity", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.False(fixture.Repository.Transaction.Committed);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task CompleteInventoryCountAsync_RejectsWhenSystemQuantityChangedAfterCreation()
    {
        var fixture = BuildFixture();
        var balance = CreateBalance(fixture.Product, fixture.PrimaryLocation, 10m);
        fixture.Repository.InventoryBalances.Add(balance);
        var service = new InventoryCountWorkflowService(fixture.Repository);
        var startedCount = await CreateAndStartCountAsync(service, fixture.Product.Id, fixture.PrimaryLocation.Id);
        balance.OnHandQuantity = 12m;

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CompleteInventoryCountAsync(
                startedCount.Id,
                new CompleteInventoryCountCommand(
                    [new CompleteInventoryCountLineCommand(startedCount.Lines[0].Id, 10m)]),
                Guid.NewGuid(),
                CancellationToken.None));

        Assert.Contains("system quantity changed", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.False(fixture.Repository.Transaction.Committed);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    private static InventoryBalance CreateBalance(
        Product product,
        Location location,
        decimal onHandQuantity,
        decimal reservedQuantity = 0m,
        decimal pickedQuantity = 0m) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Product = product,
            LocationId = location.Id,
            Location = location,
            OnHandQuantity = onHandQuantity,
            ReservedQuantity = reservedQuantity,
            PickedQuantity = pickedQuantity,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

    private static async Task<InventoryCountDto> CreateAndStartCountAsync(
        InventoryCountWorkflowService service,
        Guid productId,
        Guid locationId)
    {
        var inventoryCount = await service.CreateInventoryCountAsync(
            new CreateInventoryCountCommand(
                [new CreateInventoryCountLineCommand(productId, locationId)]),
            CancellationToken.None);

        return await service.StartInventoryCountAsync(inventoryCount.Id, CancellationToken.None);
    }

    private static TestFixture BuildFixture()
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = "FG-1000",
            Name = "Demo Finished Product",
            Barcode = "5940000000011",
            Description = "Demo finished product",
            ImageUrl = string.Empty,
            IsActive = true,
        };

        var warehouse = new Warehouse
        {
            Id = Guid.NewGuid(),
            Code = "MAIN",
            Name = "Main Warehouse",
            IsActive = true,
        };

        var zone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = "PICK",
            Name = "Picking",
            IsActive = true,
        };

        var primaryLocation = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = zone.Id,
            Zone = zone,
            Code = "PICK-A-01",
            Name = "Picking A-01",
            LocationType = LocationType.Picking,
            IsActive = true,
            IsBlocked = false,
            MapRow = 1,
            MapColumn = 0,
        };

        var secondaryLocation = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = zone.Id,
            Zone = zone,
            Code = "PICK-A-02",
            Name = "Picking A-02",
            LocationType = LocationType.Picking,
            IsActive = true,
            IsBlocked = false,
            MapRow = 1,
            MapColumn = 1,
        };

        var repository = new InMemoryInventoryCountWorkflowRepository(
            [product],
            [primaryLocation, secondaryLocation]);

        return new TestFixture(repository, product, primaryLocation, secondaryLocation);
    }

    private sealed record TestFixture(
        InMemoryInventoryCountWorkflowRepository Repository,
        Product Product,
        Location PrimaryLocation,
        Location SecondaryLocation);

    private sealed class InMemoryInventoryCountWorkflowRepository(
        IReadOnlyList<Product> products,
        IReadOnlyList<Location> locations) : IInventoryCountWorkflowRepository
    {
        private readonly List<Product> _products = [.. products];
        private readonly List<Location> _locations = [.. locations];

        public List<InventoryCountEntity> InventoryCounts { get; } = [];
        public List<InventoryBalance> InventoryBalances { get; } = [];
        public List<InventoryMovement> InventoryMovements { get; } = [];
        public RecordingInventoryCountWorkflowTransaction Transaction { get; } = new();

        public Task<IReadOnlyList<InventoryCountEntity>> ListInventoryCountsAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<InventoryCountEntity>>(InventoryCounts);

        public Task<InventoryCountEntity?> FindInventoryCountByIdAsync(Guid inventoryCountId, CancellationToken cancellationToken) =>
            Task.FromResult(InventoryCounts.SingleOrDefault(inventoryCount => inventoryCount.Id == inventoryCountId));

        public Task<IReadOnlyDictionary<Guid, Product>> FindProductsByIdsAsync(
            IReadOnlyCollection<Guid> productIds,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, Product>>(_products
                .Where(product => productIds.Contains(product.Id))
                .ToDictionary(product => product.Id));

        public Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
            IReadOnlyCollection<Guid> locationIds,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, Location>>(_locations
                .Where(location => locationIds.Contains(location.Id))
                .ToDictionary(location => location.Id));

        public Task<IReadOnlyList<InventoryBalance>> ListInventoryBalancesByProductIdsAndLocationIdsAsync(
            IReadOnlyCollection<Guid> productIds,
            IReadOnlyCollection<Guid> locationIds,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<InventoryBalance>>(InventoryBalances
                .Where(balance => productIds.Contains(balance.ProductId) && locationIds.Contains(balance.LocationId))
                .ToArray());

        public void AddInventoryCount(InventoryCountEntity inventoryCount) => InventoryCounts.Add(inventoryCount);

        public void AddInventoryBalance(InventoryBalance inventoryBalance) => InventoryBalances.Add(inventoryBalance);

        public void AddInventoryMovement(InventoryMovement inventoryMovement) => InventoryMovements.Add(inventoryMovement);

        public Task<IInventoryCountWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IInventoryCountWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingInventoryCountWorkflowTransaction : IInventoryCountWorkflowTransaction
    {
        public bool Committed { get; private set; }

        public Task CommitAsync(CancellationToken cancellationToken)
        {
            Committed = true;
            return Task.CompletedTask;
        }

        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }
}
