using Wms.Application.Picking;
using Wms.Application.Picking.Abstractions;
using Wms.Application.Picking.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.Picking;

public sealed class PickingWorkflowServiceTests
{
    [Fact]
    public async Task CreatePickingTaskAsync_DoesNotChangeReservationBeforeCompletion()
    {
        var fixture = BuildFixture();
        var salesOrder = fixture.CreateReservedSalesOrder(orderedQuantity: 6m, reservedQuantity: 6m);
        fixture.Repository.SalesOrders.Add(salesOrder);

        var service = new PickingWorkflowService(fixture.Repository);
        var line = salesOrder.Lines.Single();
        var reservation = line.Reservations.Single();

        var pickingTask = await service.CreatePickingTaskAsync(
            new CreatePickingTaskCommand(
                salesOrder.Id,
                [new CreatePickingTaskLineCommand(reservation.Id, 4m)]),
            CancellationToken.None);

        Assert.Equal(PickingTaskStatus.Pending, pickingTask.Status);
        Assert.Single(fixture.Repository.PickingTasks);
        Assert.Equal(6m, line.ReservedQuantity);
        Assert.Equal(0m, line.PickedQuantity);
        Assert.Equal(6m, fixture.Repository.InventoryBalances[0].ReservedQuantity);
        Assert.Equal(0m, fixture.Repository.InventoryBalances[0].PickedQuantity);
    }

    [Fact]
    public async Task CompletePickingTaskAsync_MovesReservedQuantityIntoPickedState()
    {
        var fixture = BuildFixture();
        var salesOrder = fixture.CreateReservedSalesOrder(orderedQuantity: 6m, reservedQuantity: 6m);
        fixture.Repository.SalesOrders.Add(salesOrder);

        var line = salesOrder.Lines.Single();
        var reservation = line.Reservations.Single();
        var pickingTask = new PickingTask
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = PickingTaskStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
        };

        pickingTask.Lines.Add(new PickingTaskLine
        {
            Id = Guid.NewGuid(),
            PickingTaskId = pickingTask.Id,
            PickingTask = pickingTask,
            SalesOrderLineId = line.Id,
            SalesOrderLine = line,
            SalesOrderReservationId = reservation.Id,
            SalesOrderReservation = reservation,
            InventoryBalanceId = reservation.InventoryBalanceId,
            InventoryBalance = reservation.InventoryBalance,
            QuantityToPick = 4m,
            PickedQuantity = 0m,
        });

        fixture.Repository.PickingTasks.Add(pickingTask);

        var service = new PickingWorkflowService(fixture.Repository);

        var completedTask = await service.CompletePickingTaskAsync(pickingTask.Id, CancellationToken.None);

        Assert.Equal(PickingTaskStatus.Completed, completedTask.Status);
        Assert.Equal(2m, reservation.Quantity);
        Assert.Equal(4m, reservation.PickedQuantity);
        Assert.Equal(2m, line.ReservedQuantity);
        Assert.Equal(4m, line.PickedQuantity);
        Assert.Equal(10m, fixture.Repository.InventoryBalances[0].OnHandQuantity);
        Assert.Equal(2m, fixture.Repository.InventoryBalances[0].ReservedQuantity);
        Assert.Equal(4m, fixture.Repository.InventoryBalances[0].PickedQuantity);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CreatePickingTaskAsync_RejectsOverAllocatedReservation()
    {
        var fixture = BuildFixture();
        var salesOrder = fixture.CreateReservedSalesOrder(orderedQuantity: 6m, reservedQuantity: 6m);
        fixture.Repository.SalesOrders.Add(salesOrder);

        var line = salesOrder.Lines.Single();
        var reservation = line.Reservations.Single();
        var existingTask = new PickingTask
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = PickingTaskStatus.Pending,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };
        existingTask.Lines.Add(new PickingTaskLine
        {
            Id = Guid.NewGuid(),
            PickingTaskId = existingTask.Id,
            PickingTask = existingTask,
            SalesOrderLineId = line.Id,
            SalesOrderLine = line,
            SalesOrderReservationId = reservation.Id,
            SalesOrderReservation = reservation,
            InventoryBalanceId = reservation.InventoryBalanceId,
            InventoryBalance = reservation.InventoryBalance,
            QuantityToPick = 5m,
            PickedQuantity = 0m,
        });
        fixture.Repository.PickingTasks.Add(existingTask);

        var service = new PickingWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreatePickingTaskAsync(
                new CreatePickingTaskCommand(
                    salesOrder.Id,
                    [new CreatePickingTaskLineCommand(reservation.Id, 2m)]),
                CancellationToken.None));
    }

    [Fact]
    public async Task CancelPickingTaskAsync_RejectsCompletedTask()
    {
        var fixture = BuildFixture();
        var salesOrder = fixture.CreateReservedSalesOrder(orderedQuantity: 4m, reservedQuantity: 4m);
        fixture.Repository.SalesOrders.Add(salesOrder);

        fixture.Repository.PickingTasks.Add(new PickingTask
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = PickingTaskStatus.Completed,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CompletedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new PickingWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CancelPickingTaskAsync(fixture.Repository.PickingTasks[0].Id, CancellationToken.None));
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

        var location = new Location
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
            MapColumn = 1,
        };

        var repository = new InMemoryPickingWorkflowRepository();

        return new TestFixture(repository, product, warehouse, zone, location);
    }

    private sealed record TestFixture(
        InMemoryPickingWorkflowRepository Repository,
        Product Product,
        Warehouse Warehouse,
        Zone Zone,
        Location Location)
    {
        public SalesOrder CreateReservedSalesOrder(decimal orderedQuantity, decimal reservedQuantity)
        {
            var balance = new InventoryBalance
            {
                Id = Guid.NewGuid(),
                ProductId = Product.Id,
                Product = Product,
                LocationId = Location.Id,
                Location = Location,
                OnHandQuantity = 10m,
                ReservedQuantity = reservedQuantity,
                PickedQuantity = 0m,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };

            Repository.InventoryBalances.Add(balance);

            var salesOrder = new SalesOrder
            {
                Id = Guid.NewGuid(),
                Status = SalesOrderStatus.FullyReserved,
                CreatedAtUtc = DateTimeOffset.UtcNow,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
                ConfirmedAtUtc = DateTimeOffset.UtcNow,
            };

            var line = new SalesOrderLine
            {
                Id = Guid.NewGuid(),
                SalesOrderId = salesOrder.Id,
                SalesOrder = salesOrder,
                ProductId = Product.Id,
                Product = Product,
                OrderedQuantity = orderedQuantity,
                ReservedQuantity = reservedQuantity,
                PickedQuantity = 0m,
            };

            var reservation = new SalesOrderReservation
            {
                Id = Guid.NewGuid(),
                SalesOrderLineId = line.Id,
                SalesOrderLine = line,
                InventoryBalanceId = balance.Id,
                InventoryBalance = balance,
                Quantity = reservedQuantity,
                PickedQuantity = 0m,
                CreatedAtUtc = DateTimeOffset.UtcNow,
            };

            line.Reservations.Add(reservation);
            salesOrder.Lines.Add(line);
            return salesOrder;
        }
    }

    private sealed class InMemoryPickingWorkflowRepository : IPickingWorkflowRepository
    {
        public List<SalesOrder> SalesOrders { get; } = [];
        public List<PickingTask> PickingTasks { get; } = [];
        public List<InventoryBalance> InventoryBalances { get; } = [];
        public RecordingPickingWorkflowTransaction Transaction { get; } = new();

        public Task<IReadOnlyList<PickingTask>> ListPickingTasksAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<PickingTask>>(PickingTasks);

        public Task<PickingTask?> FindPickingTaskByIdAsync(Guid pickingTaskId, CancellationToken cancellationToken) =>
            Task.FromResult(PickingTasks.SingleOrDefault(task => task.Id == pickingTaskId));

        public Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
            Task.FromResult(SalesOrders.SingleOrDefault(order => order.Id == salesOrderId));

        public Task<IReadOnlyDictionary<Guid, decimal>> ListOpenAllocatedQuantitiesByReservationIdsAsync(
            IReadOnlyCollection<Guid> reservationIds,
            Guid? excludedPickingTaskId,
            CancellationToken cancellationToken)
        {
            var allocations = PickingTasks
                .Where(task =>
                    task.Status != PickingTaskStatus.Completed &&
                    task.Status != PickingTaskStatus.Cancelled &&
                    (!excludedPickingTaskId.HasValue || task.Id != excludedPickingTaskId.Value))
                .SelectMany(task => task.Lines)
                .Where(line => reservationIds.Contains(line.SalesOrderReservationId))
                .GroupBy(line => line.SalesOrderReservationId)
                .ToDictionary(group => group.Key, group => group.Sum(line => line.QuantityToPick));

            return Task.FromResult<IReadOnlyDictionary<Guid, decimal>>(allocations);
        }

        public void AddPickingTask(PickingTask pickingTask) => PickingTasks.Add(pickingTask);

        public Task<IPickingWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IPickingWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingPickingWorkflowTransaction : IPickingWorkflowTransaction
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
