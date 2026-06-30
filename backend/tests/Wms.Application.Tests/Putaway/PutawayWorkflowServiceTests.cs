using Wms.Application.Putaway;
using Wms.Application.Putaway.Abstractions;
using Wms.Application.Putaway.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using Wms.Domain.Putaway;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.Putaway;

public sealed class PutawayWorkflowServiceTests
{
    [Fact]
    public async Task CreatePutawayTaskAsync_DoesNotChangeStockBeforeCompletion()
    {
        var fixture = BuildFixture();
        fixture.Repository.InventoryBalances.Add(new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.SourceLocation.Id,
            Location = fixture.SourceLocation,
            OnHandQuantity = 10m,
            ReservedQuantity = 0m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new PutawayWorkflowService(fixture.Repository);

        var putawayTask = await service.CreatePutawayTaskAsync(
            new CreatePutawayTaskCommand(
                fixture.Product.Id,
                fixture.SourceLocation.Id,
                fixture.DestinationLocation.Id,
                null,
                4m,
                "Move demo stock"),
            CancellationToken.None);

        Assert.Equal(PutawayTaskStatus.Pending, putawayTask.Status);
        Assert.Single(fixture.Repository.PutawayTasks);
        Assert.Single(fixture.Repository.InventoryBalances);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task CompletePutawayTaskAsync_UpdatesBalancesAndCreatesRelocationMovement()
    {
        var fixture = BuildFixture();
        var sourceBalance = new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.SourceLocation.Id,
            Location = fixture.SourceLocation,
            OnHandQuantity = 10m,
            ReservedQuantity = 2m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

        fixture.Repository.InventoryBalances.Add(sourceBalance);

        var putawayTask = new PutawayTask
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            DestinationLocationId = fixture.DestinationLocation.Id,
            DestinationLocation = fixture.DestinationLocation,
            Quantity = 4m,
            Status = PutawayTaskStatus.InProgress,
            Notes = "Put away demo stock",
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
        };

        fixture.Repository.PutawayTasks.Add(putawayTask);
        var service = new PutawayWorkflowService(fixture.Repository);
        var currentUserId = Guid.NewGuid();

        var completedTask = await service.CompletePutawayTaskAsync(
            putawayTask.Id,
            currentUserId,
            CancellationToken.None);

        Assert.Equal(PutawayTaskStatus.Completed, completedTask.Status);
        Assert.Equal(6m, sourceBalance.OnHandQuantity);
        Assert.Equal(2m, sourceBalance.ReservedQuantity);

        var destinationBalance = Assert.Single(
            fixture.Repository.InventoryBalances,
            balance => balance.LocationId == fixture.DestinationLocation.Id);
        Assert.Equal(4m, destinationBalance.OnHandQuantity);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Relocation, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.Equal("PutawayTask", fixture.Repository.InventoryMovements[0].ReferenceType);
        Assert.Equal(putawayTask.Id.ToString(), fixture.Repository.InventoryMovements[0].ReferenceId);
        Assert.Equal(currentUserId, fixture.Repository.InventoryMovements[0].PerformedByUserId);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CreatePutawayTaskAsync_RejectsReceivingDestination()
    {
        var fixture = BuildFixture();
        fixture.Repository.InventoryBalances.Add(new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.SourceLocation.Id,
            Location = fixture.SourceLocation,
            OnHandQuantity = 10m,
            ReservedQuantity = 0m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        });

        fixture.DestinationLocation.LocationType = LocationType.Receiving;
        var service = new PutawayWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreatePutawayTaskAsync(
                new CreatePutawayTaskCommand(
                    fixture.Product.Id,
                    fixture.SourceLocation.Id,
                    fixture.DestinationLocation.Id,
                    null,
                    2m,
                    null),
                CancellationToken.None));

        Assert.Contains("cannot be of type", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CompletePutawayTaskAsync_RejectsWhenSourceAvailableStockIsInsufficient()
    {
        var fixture = BuildFixture();
        fixture.Repository.InventoryBalances.Add(new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.SourceLocation.Id,
            Location = fixture.SourceLocation,
            OnHandQuantity = 5m,
            ReservedQuantity = 3m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        });

        fixture.Repository.PutawayTasks.Add(new PutawayTask
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            DestinationLocationId = fixture.DestinationLocation.Id,
            DestinationLocation = fixture.DestinationLocation,
            Quantity = 3m,
            Status = PutawayTaskStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new PutawayWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CompletePutawayTaskAsync(
                fixture.Repository.PutawayTasks[0].Id,
                Guid.NewGuid(),
                CancellationToken.None));

        Assert.Contains("exceeds the available stock", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.False(fixture.Repository.Transaction.Committed);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task CancelPutawayTaskAsync_RejectsCompletedTask()
    {
        var fixture = BuildFixture();
        fixture.Repository.PutawayTasks.Add(new PutawayTask
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            DestinationLocationId = fixture.DestinationLocation.Id,
            DestinationLocation = fixture.DestinationLocation,
            Quantity = 2m,
            Status = PutawayTaskStatus.Completed,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CompletedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new PutawayWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CancelPutawayTaskAsync(fixture.Repository.PutawayTasks[0].Id, CancellationToken.None));
    }

    private static TestFixture BuildFixture()
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = "RM-2000",
            Name = "Demo Raw Material",
            Barcode = "5940000000028",
            Description = "Demo raw material",
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

        var receivingZone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = "RECV",
            Name = "Receiving",
            IsActive = true,
        };

        var bulkZone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = "BULK",
            Name = "Bulk Storage",
            IsActive = true,
        };

        var sourceLocation = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = receivingZone.Id,
            Zone = receivingZone,
            Code = "REC-A-01",
            Name = "Receiving A-01",
            LocationType = LocationType.Receiving,
            IsActive = true,
            IsBlocked = false,
            MapRow = 0,
            MapColumn = 0,
        };

        var destinationLocation = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = bulkZone.Id,
            Zone = bulkZone,
            Code = "BULK-A-01",
            Name = "Bulk A-01",
            LocationType = LocationType.Bulk,
            IsActive = true,
            IsBlocked = false,
            MapRow = 1,
            MapColumn = 1,
        };

        var repository = new InMemoryPutawayWorkflowRepository(
            [product],
            [sourceLocation, destinationLocation]);

        return new TestFixture(repository, product, sourceLocation, destinationLocation);
    }

    private sealed record TestFixture(
        InMemoryPutawayWorkflowRepository Repository,
        Product Product,
        Location SourceLocation,
        Location DestinationLocation);

    private sealed class InMemoryPutawayWorkflowRepository(
        IReadOnlyList<Product> products,
        IReadOnlyList<Location> locations) : IPutawayWorkflowRepository
    {
        private readonly List<Product> _products = [.. products];
        private readonly List<Location> _locations = [.. locations];
        private readonly List<ReceiptLine> _receiptLines = [];

        public List<PutawayTask> PutawayTasks { get; } = [];
        public List<InventoryBalance> InventoryBalances { get; } = [];
        public List<InventoryMovement> InventoryMovements { get; } = [];
        public RecordingPutawayWorkflowTransaction Transaction { get; } = new();

        public Task<IReadOnlyList<PutawayTask>> ListPutawayTasksAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<PutawayTask>>(PutawayTasks);

        public Task<PutawayTask?> FindPutawayTaskByIdAsync(Guid putawayTaskId, CancellationToken cancellationToken) =>
            Task.FromResult(PutawayTasks.SingleOrDefault(putawayTask => putawayTask.Id == putawayTaskId));

        public Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken) =>
            Task.FromResult(_products.SingleOrDefault(product => product.Id == productId));

        public Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
            IReadOnlyCollection<Guid> locationIds,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, Location>>(_locations
                .Where(location => locationIds.Contains(location.Id))
                .ToDictionary(location => location.Id));

        public Task<ReceiptLine?> FindReceiptLineByIdAsync(Guid receiptLineId, CancellationToken cancellationToken) =>
            Task.FromResult(_receiptLines.SingleOrDefault(receiptLine => receiptLine.Id == receiptLineId));

        public Task<InventoryBalance?> FindInventoryBalanceAsync(
            Guid productId,
            Guid locationId,
            CancellationToken cancellationToken) =>
            Task.FromResult(InventoryBalances.SingleOrDefault(balance =>
                balance.ProductId == productId &&
                balance.LocationId == locationId));

        public void AddPutawayTask(PutawayTask putawayTask) => PutawayTasks.Add(putawayTask);

        public void AddInventoryBalance(InventoryBalance balance) => InventoryBalances.Add(balance);

        public void AddInventoryMovement(InventoryMovement movement) => InventoryMovements.Add(movement);

        public Task<IPutawayWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IPutawayWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingPutawayWorkflowTransaction : IPutawayWorkflowTransaction
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
