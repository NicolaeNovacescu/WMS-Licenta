using Wms.Application.Transfer;
using Wms.Application.Transfer.Abstractions;
using Wms.Application.Transfer.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Transfer;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.Transfer;

public sealed class TransferWorkflowServiceTests
{
    [Fact]
    public async Task CreateTransferTaskAsync_DoesNotChangeStockBeforeCompletion()
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

        var service = new TransferWorkflowService(fixture.Repository);

        var transferTask = await service.CreateTransferTaskAsync(
            new CreateTransferTaskCommand(
                fixture.Product.Id,
                fixture.SourceLocation.Id,
                fixture.DestinationLocation.Id,
                4m,
                "Move stock between active locations"),
            CancellationToken.None);

        Assert.Equal(TransferTaskStatus.Pending, transferTask.Status);
        Assert.Single(fixture.Repository.TransferTasks);
        Assert.Single(fixture.Repository.InventoryBalances);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task CompleteTransferTaskAsync_UpdatesBalancesAndCreatesRelocationMovement()
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

        var transferTask = new TransferTask
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            DestinationLocationId = fixture.DestinationLocation.Id,
            DestinationLocation = fixture.DestinationLocation,
            Quantity = 4m,
            Status = TransferTaskStatus.InProgress,
            Reason = "Reposition stock",
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
        };

        fixture.Repository.TransferTasks.Add(transferTask);
        var service = new TransferWorkflowService(fixture.Repository);
        var currentUserId = Guid.NewGuid();

        var completedTask = await service.CompleteTransferTaskAsync(
            transferTask.Id,
            currentUserId,
            CancellationToken.None);

        Assert.Equal(TransferTaskStatus.Completed, completedTask.Status);
        Assert.Equal(6m, sourceBalance.OnHandQuantity);
        Assert.Equal(2m, sourceBalance.ReservedQuantity);

        var destinationBalance = Assert.Single(
            fixture.Repository.InventoryBalances,
            balance => balance.LocationId == fixture.DestinationLocation.Id);
        Assert.Equal(4m, destinationBalance.OnHandQuantity);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Relocation, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.Equal("TransferTask", fixture.Repository.InventoryMovements[0].ReferenceType);
        Assert.Equal(transferTask.Id.ToString(), fixture.Repository.InventoryMovements[0].ReferenceId);
        Assert.Equal(currentUserId, fixture.Repository.InventoryMovements[0].PerformedByUserId);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CreateTransferTaskAsync_RejectsReceivingSource()
    {
        var fixture = BuildFixture();
        fixture.SourceLocation.LocationType = LocationType.Receiving;
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

        var service = new TransferWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateTransferTaskAsync(
                new CreateTransferTaskCommand(
                    fixture.Product.Id,
                    fixture.SourceLocation.Id,
                    fixture.DestinationLocation.Id,
                    2m,
                    null),
                CancellationToken.None));

        Assert.Contains("cannot be of type", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateTransferTaskAsync_AllowsBlockedSourceLocation()
    {
        var fixture = BuildFixture();
        fixture.SourceLocation.IsBlocked = true;
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

        var service = new TransferWorkflowService(fixture.Repository);

        var transferTask = await service.CreateTransferTaskAsync(
            new CreateTransferTaskCommand(
                fixture.Product.Id,
                fixture.SourceLocation.Id,
                fixture.DestinationLocation.Id,
                3m,
                "Move stock out of a blocked-but-active source"),
            CancellationToken.None);

        Assert.Equal(TransferTaskStatus.Pending, transferTask.Status);
    }

    [Fact]
    public async Task CompleteTransferTaskAsync_RejectsWhenSourceAvailableStockIsInsufficient()
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

        fixture.Repository.TransferTasks.Add(new TransferTask
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            DestinationLocationId = fixture.DestinationLocation.Id,
            DestinationLocation = fixture.DestinationLocation,
            Quantity = 3m,
            Status = TransferTaskStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new TransferWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CompleteTransferTaskAsync(
                fixture.Repository.TransferTasks[0].Id,
                Guid.NewGuid(),
                CancellationToken.None));

        Assert.Contains("exceeds the available stock", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.False(fixture.Repository.Transaction.Committed);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task CancelTransferTaskAsync_RejectsCompletedTask()
    {
        var fixture = BuildFixture();
        fixture.Repository.TransferTasks.Add(new TransferTask
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            DestinationLocationId = fixture.DestinationLocation.Id,
            DestinationLocation = fixture.DestinationLocation,
            Quantity = 2m,
            Status = TransferTaskStatus.Completed,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CompletedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new TransferWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CancelTransferTaskAsync(fixture.Repository.TransferTasks[0].Id, CancellationToken.None));
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

        var pickingZone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = "PICK",
            Name = "Picking",
            IsActive = true,
        };

        var stagingZone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = "STAGE",
            Name = "Staging",
            IsActive = true,
        };

        var sourceLocation = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = pickingZone.Id,
            Zone = pickingZone,
            Code = "PICK-A-01",
            Name = "Picking A-01",
            LocationType = LocationType.Picking,
            IsActive = true,
            IsBlocked = false,
            MapRow = 1,
            MapColumn = 0,
        };

        var destinationLocation = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = stagingZone.Id,
            Zone = stagingZone,
            Code = "STAGE-A-02",
            Name = "Staging A-02",
            LocationType = LocationType.Staging,
            IsActive = true,
            IsBlocked = false,
            MapRow = 2,
            MapColumn = 2,
        };

        var repository = new InMemoryTransferWorkflowRepository(
            [product],
            [sourceLocation, destinationLocation]);

        return new TestFixture(repository, product, sourceLocation, destinationLocation);
    }

    private sealed record TestFixture(
        InMemoryTransferWorkflowRepository Repository,
        Product Product,
        Location SourceLocation,
        Location DestinationLocation);

    private sealed class InMemoryTransferWorkflowRepository(
        IReadOnlyList<Product> products,
        IReadOnlyList<Location> locations) : ITransferWorkflowRepository
    {
        private readonly List<Product> _products = [.. products];
        private readonly List<Location> _locations = [.. locations];

        public List<TransferTask> TransferTasks { get; } = [];
        public List<InventoryBalance> InventoryBalances { get; } = [];
        public List<InventoryMovement> InventoryMovements { get; } = [];
        public RecordingTransferWorkflowTransaction Transaction { get; } = new();

        public Task<IReadOnlyList<TransferTask>> ListTransferTasksAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<TransferTask>>(TransferTasks);

        public Task<TransferTask?> FindTransferTaskByIdAsync(Guid transferTaskId, CancellationToken cancellationToken) =>
            Task.FromResult(TransferTasks.SingleOrDefault(transferTask => transferTask.Id == transferTaskId));

        public Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken) =>
            Task.FromResult(_products.SingleOrDefault(product => product.Id == productId));

        public Task<IReadOnlyDictionary<Guid, Location>> FindLocationsByIdsAsync(
            IReadOnlyCollection<Guid> locationIds,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, Location>>(_locations
                .Where(location => locationIds.Contains(location.Id))
                .ToDictionary(location => location.Id));

        public Task<InventoryBalance?> FindInventoryBalanceAsync(
            Guid productId,
            Guid locationId,
            CancellationToken cancellationToken) =>
            Task.FromResult(InventoryBalances.SingleOrDefault(balance =>
                balance.ProductId == productId &&
                balance.LocationId == locationId));

        public void AddTransferTask(TransferTask transferTask) => TransferTasks.Add(transferTask);

        public void AddInventoryBalance(InventoryBalance balance) => InventoryBalances.Add(balance);

        public void AddInventoryMovement(InventoryMovement movement) => InventoryMovements.Add(movement);

        public Task<ITransferWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<ITransferWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingTransferWorkflowTransaction : ITransferWorkflowTransaction
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
