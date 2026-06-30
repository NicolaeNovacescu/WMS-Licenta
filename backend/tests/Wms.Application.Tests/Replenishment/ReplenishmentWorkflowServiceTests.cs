using Wms.Application.Replenishment;
using Wms.Application.Replenishment.Abstractions;
using Wms.Application.Replenishment.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Replenishment;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.Replenishment;

public sealed class ReplenishmentWorkflowServiceTests
{
    [Fact]
    public async Task CreateReplenishmentRuleAsync_RejectsTargetQuantityNotAboveThreshold()
    {
        var fixture = BuildFixture();
        var service = new ReplenishmentWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            service.CreateReplenishmentRuleAsync(
                new CreateReplenishmentRuleCommand(
                    fixture.Product.Id,
                    fixture.TargetLocation.Id,
                    8m,
                    8m),
                CancellationToken.None));

        Assert.Equal("targetQuantity", exception.ParamName);
    }

    [Fact]
    public async Task CreateReplenishmentTaskAsync_DoesNotChangeStockBeforeCompletion()
    {
        var fixture = BuildFixture();
        fixture.Repository.ReplenishmentRules.Add(CreateActiveRule(fixture));
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
        fixture.Repository.InventoryBalances.Add(new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.TargetLocation.Id,
            Location = fixture.TargetLocation,
            OnHandQuantity = 4m,
            ReservedQuantity = 1m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new ReplenishmentWorkflowService(fixture.Repository);

        var replenishmentTask = await service.CreateReplenishmentTaskAsync(
            new CreateReplenishmentTaskCommand(
                fixture.Product.Id,
                fixture.SourceLocation.Id,
                fixture.TargetLocation.Id,
                5m),
            CancellationToken.None);

        Assert.Equal(ReplenishmentTaskStatus.Pending, replenishmentTask.Status);
        Assert.Single(fixture.Repository.ReplenishmentTasks);
        Assert.Equal(2, fixture.Repository.InventoryBalances.Count);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task CreateReplenishmentTaskAsync_RejectsWhenTargetAvailableIsNotBelowThreshold()
    {
        var fixture = BuildFixture();
        fixture.Repository.ReplenishmentRules.Add(CreateActiveRule(fixture));
        fixture.Repository.InventoryBalances.Add(new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.SourceLocation.Id,
            Location = fixture.SourceLocation,
            OnHandQuantity = 12m,
            ReservedQuantity = 0m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        });
        fixture.Repository.InventoryBalances.Add(new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.TargetLocation.Id,
            Location = fixture.TargetLocation,
            OnHandQuantity = 5m,
            ReservedQuantity = 0m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new ReplenishmentWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateReplenishmentTaskAsync(
                new CreateReplenishmentTaskCommand(
                    fixture.Product.Id,
                    fixture.SourceLocation.Id,
                    fixture.TargetLocation.Id,
                    2m),
                CancellationToken.None));

        Assert.Contains("not below the configured replenishment threshold", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateReplenishmentTaskAsync_AllowsBlockedSourceLocation()
    {
        var fixture = BuildFixture();
        fixture.SourceLocation.IsBlocked = true;
        fixture.Repository.ReplenishmentRules.Add(CreateActiveRule(fixture));
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
        fixture.Repository.InventoryBalances.Add(new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.TargetLocation.Id,
            Location = fixture.TargetLocation,
            OnHandQuantity = 4m,
            ReservedQuantity = 1m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new ReplenishmentWorkflowService(fixture.Repository);

        var replenishmentTask = await service.CreateReplenishmentTaskAsync(
            new CreateReplenishmentTaskCommand(
                fixture.Product.Id,
                fixture.SourceLocation.Id,
                fixture.TargetLocation.Id,
                3m),
            CancellationToken.None);

        Assert.Equal(ReplenishmentTaskStatus.Pending, replenishmentTask.Status);
    }

    [Fact]
    public async Task CompleteReplenishmentTaskAsync_UpdatesBalancesAndCreatesRelocationMovement()
    {
        var fixture = BuildFixture();
        var rule = CreateActiveRule(fixture);
        fixture.Repository.ReplenishmentRules.Add(rule);

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

        var targetBalance = new InventoryBalance
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            LocationId = fixture.TargetLocation.Id,
            Location = fixture.TargetLocation,
            OnHandQuantity = 4m,
            ReservedQuantity = 1m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

        fixture.Repository.InventoryBalances.Add(sourceBalance);
        fixture.Repository.InventoryBalances.Add(targetBalance);
        fixture.Repository.ReplenishmentTasks.Add(new ReplenishmentTask
        {
            Id = Guid.NewGuid(),
            ReplenishmentRuleId = rule.Id,
            ReplenishmentRule = rule,
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            TargetLocationId = fixture.TargetLocation.Id,
            TargetLocation = fixture.TargetLocation,
            Quantity = 4m,
            Status = ReplenishmentTaskStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new ReplenishmentWorkflowService(fixture.Repository);
        var currentUserId = Guid.NewGuid();

        var completedTask = await service.CompleteReplenishmentTaskAsync(
            fixture.Repository.ReplenishmentTasks[0].Id,
            currentUserId,
            CancellationToken.None);

        Assert.Equal(ReplenishmentTaskStatus.Completed, completedTask.Status);
        Assert.Equal(6m, sourceBalance.OnHandQuantity);
        Assert.Equal(8m, targetBalance.OnHandQuantity);
        Assert.Equal(1m, targetBalance.ReservedQuantity);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Relocation, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.Equal("ReplenishmentTask", fixture.Repository.InventoryMovements[0].ReferenceType);
        Assert.Equal(currentUserId, fixture.Repository.InventoryMovements[0].PerformedByUserId);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CancelReplenishmentTaskAsync_RejectsCompletedTask()
    {
        var fixture = BuildFixture();
        var rule = CreateActiveRule(fixture);
        fixture.Repository.ReplenishmentRules.Add(rule);
        fixture.Repository.ReplenishmentTasks.Add(new ReplenishmentTask
        {
            Id = Guid.NewGuid(),
            ReplenishmentRuleId = rule.Id,
            ReplenishmentRule = rule,
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            SourceLocationId = fixture.SourceLocation.Id,
            SourceLocation = fixture.SourceLocation,
            TargetLocationId = fixture.TargetLocation.Id,
            TargetLocation = fixture.TargetLocation,
            Quantity = 2m,
            Status = ReplenishmentTaskStatus.Completed,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CompletedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new ReplenishmentWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CancelReplenishmentTaskAsync(
                fixture.Repository.ReplenishmentTasks[0].Id,
                CancellationToken.None));
    }

    private static ReplenishmentRule CreateActiveRule(TestFixture fixture) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductId = fixture.Product.Id,
            Product = fixture.Product,
            TargetLocationId = fixture.TargetLocation.Id,
            TargetLocation = fixture.TargetLocation,
            MinimumThreshold = 5m,
            TargetQuantity = 12m,
            IsActive = true,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

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

        var targetLocation = new Location
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

        var repository = new InMemoryReplenishmentWorkflowRepository(
            [product],
            [sourceLocation, targetLocation]);

        return new TestFixture(repository, product, sourceLocation, targetLocation);
    }

    private sealed record TestFixture(
        InMemoryReplenishmentWorkflowRepository Repository,
        Product Product,
        Location SourceLocation,
        Location TargetLocation);

    private sealed class InMemoryReplenishmentWorkflowRepository(
        IReadOnlyList<Product> products,
        IReadOnlyList<Location> locations) : IReplenishmentWorkflowRepository
    {
        private readonly List<Product> _products = [.. products];
        private readonly List<Location> _locations = [.. locations];

        public List<ReplenishmentRule> ReplenishmentRules { get; } = [];
        public List<ReplenishmentTask> ReplenishmentTasks { get; } = [];
        public List<InventoryBalance> InventoryBalances { get; } = [];
        public List<InventoryMovement> InventoryMovements { get; } = [];
        public RecordingReplenishmentWorkflowTransaction Transaction { get; } = new();

        public Task<IReadOnlyList<ReplenishmentRule>> ListReplenishmentRulesAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ReplenishmentRule>>(ReplenishmentRules);

        public Task<ReplenishmentRule?> FindReplenishmentRuleByIdAsync(Guid replenishmentRuleId, CancellationToken cancellationToken) =>
            Task.FromResult(ReplenishmentRules.SingleOrDefault(replenishmentRule => replenishmentRule.Id == replenishmentRuleId));

        public Task<ReplenishmentRule?> FindActiveReplenishmentRuleAsync(
            Guid productId,
            Guid targetLocationId,
            CancellationToken cancellationToken) =>
            Task.FromResult(ReplenishmentRules.SingleOrDefault(replenishmentRule =>
                replenishmentRule.IsActive &&
                replenishmentRule.ProductId == productId &&
                replenishmentRule.TargetLocationId == targetLocationId));

        public Task<bool> HasConflictingActiveReplenishmentRuleAsync(
            Guid productId,
            Guid targetLocationId,
            Guid? excludedRuleId,
            CancellationToken cancellationToken) =>
            Task.FromResult(ReplenishmentRules.Any(replenishmentRule =>
                replenishmentRule.IsActive &&
                replenishmentRule.ProductId == productId &&
                replenishmentRule.TargetLocationId == targetLocationId &&
                (!excludedRuleId.HasValue || replenishmentRule.Id != excludedRuleId.Value)));

        public Task<IReadOnlyList<ReplenishmentTask>> ListReplenishmentTasksAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ReplenishmentTask>>(ReplenishmentTasks);

        public Task<ReplenishmentTask?> FindReplenishmentTaskByIdAsync(Guid replenishmentTaskId, CancellationToken cancellationToken) =>
            Task.FromResult(ReplenishmentTasks.SingleOrDefault(replenishmentTask => replenishmentTask.Id == replenishmentTaskId));

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

        public void AddReplenishmentRule(ReplenishmentRule replenishmentRule) => ReplenishmentRules.Add(replenishmentRule);

        public void AddReplenishmentTask(ReplenishmentTask replenishmentTask) => ReplenishmentTasks.Add(replenishmentTask);

        public void AddInventoryBalance(InventoryBalance balance) => InventoryBalances.Add(balance);

        public void AddInventoryMovement(InventoryMovement movement) => InventoryMovements.Add(movement);

        public Task<IReplenishmentWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReplenishmentWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingReplenishmentWorkflowTransaction : IReplenishmentWorkflowTransaction
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
