using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Shipment;
using Wms.Application.Shipment.Abstractions;
using Wms.Application.Shipment.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using Wms.Domain.WarehouseStructure;
using ShipmentEntity = Wms.Domain.Shipment.Shipment;
using ShipmentLineEntity = Wms.Domain.Shipment.ShipmentLine;
using Wms.Domain.Shipment;
using Xunit;

namespace Wms.Application.Tests.Shipment;

public sealed class ShipmentWorkflowServiceTests
{
    [Fact]
    public async Task CreateShipmentAsync_DoesNotChangeInventoryBeforeCompletion()
    {
        var fixture = BuildFixture();
        var scenario = fixture.CreatePickedDemandScenario(quantityPicked: 4m, onHandQuantity: 10m);

        var service = new ShipmentWorkflowService(fixture.Repository);

        var shipment = await service.CreateShipmentAsync(
            new CreateShipmentCommand(
                scenario.SalesOrder.Id,
                [new CreateShipmentLineCommand(scenario.PickingTaskLine.Id, 3m)]),
            CancellationToken.None);

        Assert.Equal(ShipmentStatus.Pending, shipment.Status);
        Assert.Single(fixture.Repository.Shipments);
        Assert.Equal(10m, scenario.InventoryBalance.OnHandQuantity);
        Assert.Equal(4m, scenario.InventoryBalance.PickedQuantity);
        Assert.Equal(4m, scenario.SalesOrderLine.PickedQuantity);
        Assert.Equal(4m, scenario.Reservation.PickedQuantity);
    }

    [Fact]
    public async Task CompleteShipmentAsync_ReducesOnHandAndPickedAndWritesRemovalMovement()
    {
        var fixture = BuildFixture();
        var scenario = fixture.CreatePickedDemandScenario(quantityPicked: 4m, onHandQuantity: 10m);

        var shipment = new ShipmentEntity
        {
            Id = Guid.NewGuid(),
            SalesOrderId = scenario.SalesOrder.Id,
            SalesOrder = scenario.SalesOrder,
            Status = ShipmentStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
        };

        shipment.Lines.Add(new ShipmentLineEntity
        {
            Id = Guid.NewGuid(),
            ShipmentId = shipment.Id,
            Shipment = shipment,
            PickingTaskLineId = scenario.PickingTaskLine.Id,
            PickingTaskLine = scenario.PickingTaskLine,
            QuantityToShip = 3m,
            ShippedQuantity = 0m,
        });

        fixture.Repository.Shipments.Add(shipment);

        var service = new ShipmentWorkflowService(fixture.Repository);

        var completedShipment = await service.CompleteShipmentAsync(
            shipment.Id,
            Guid.NewGuid(),
            CancellationToken.None);

        Assert.Equal(ShipmentStatus.Completed, completedShipment.Status);
        Assert.Equal(7m, scenario.InventoryBalance.OnHandQuantity);
        Assert.Equal(1m, scenario.InventoryBalance.PickedQuantity);
        Assert.Equal(1m, scenario.SalesOrderLine.PickedQuantity);
        Assert.Equal(1m, scenario.Reservation.PickedQuantity);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Removal, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.Equal("Shipment", fixture.Repository.InventoryMovements[0].ReferenceType);
        Assert.Equal(shipment.Id.ToString(), fixture.Repository.InventoryMovements[0].ReferenceId);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CreateShipmentAsync_RejectsWhenOpenShipmentAlreadyAllocatedQuantity()
    {
        var fixture = BuildFixture();
        var scenario = fixture.CreatePickedDemandScenario(quantityPicked: 4m, onHandQuantity: 10m);

        fixture.Repository.Shipments.Add(new ShipmentEntity
        {
            Id = Guid.NewGuid(),
            SalesOrderId = scenario.SalesOrder.Id,
            SalesOrder = scenario.SalesOrder,
            Status = ShipmentStatus.Pending,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            Lines =
            [
                new ShipmentLineEntity
                {
                    Id = Guid.NewGuid(),
                    PickingTaskLineId = scenario.PickingTaskLine.Id,
                    PickingTaskLine = scenario.PickingTaskLine,
                    QuantityToShip = 3m,
                    ShippedQuantity = 0m,
                },
            ],
        });

        var service = new ShipmentWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateShipmentAsync(
                new CreateShipmentCommand(
                    scenario.SalesOrder.Id,
                    [new CreateShipmentLineCommand(scenario.PickingTaskLine.Id, 2m)]),
                CancellationToken.None));
    }

    [Fact]
    public async Task CreateShipmentAsync_RejectsWhenPickedLineAlreadyFullyShipped()
    {
        var fixture = BuildFixture();
        var scenario = fixture.CreatePickedDemandScenario(quantityPicked: 4m, onHandQuantity: 10m);

        fixture.Repository.Shipments.Add(new ShipmentEntity
        {
            Id = Guid.NewGuid(),
            SalesOrderId = scenario.SalesOrder.Id,
            SalesOrder = scenario.SalesOrder,
            Status = ShipmentStatus.Completed,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CompletedAtUtc = DateTimeOffset.UtcNow,
            Lines =
            [
                new ShipmentLineEntity
                {
                    Id = Guid.NewGuid(),
                    PickingTaskLineId = scenario.PickingTaskLine.Id,
                    PickingTaskLine = scenario.PickingTaskLine,
                    QuantityToShip = 4m,
                    ShippedQuantity = 4m,
                },
            ],
        });

        var service = new ShipmentWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateShipmentAsync(
                new CreateShipmentCommand(
                    scenario.SalesOrder.Id,
                    [new CreateShipmentLineCommand(scenario.PickingTaskLine.Id, 1m)]),
                CancellationToken.None));
    }

    [Fact]
    public async Task CompleteShipmentAsync_WritesAuditEntry()
    {
        var fixture = BuildFixture();
        var scenario = fixture.CreatePickedDemandScenario(quantityPicked: 4m, onHandQuantity: 10m);

        var shipment = new ShipmentEntity
        {
            Id = Guid.NewGuid(),
            SalesOrderId = scenario.SalesOrder.Id,
            SalesOrder = scenario.SalesOrder,
            Status = ShipmentStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
        };

        shipment.Lines.Add(new ShipmentLineEntity
        {
            Id = Guid.NewGuid(),
            ShipmentId = shipment.Id,
            Shipment = shipment,
            PickingTaskLineId = scenario.PickingTaskLine.Id,
            PickingTaskLine = scenario.PickingTaskLine,
            QuantityToShip = 3m,
            ShippedQuantity = 0m,
        });

        fixture.Repository.Shipments.Add(shipment);

        var auditLogWriter = new RecordingAuditLogWriter();
        var service = new ShipmentWorkflowService(fixture.Repository, auditLogWriter);

        await service.CompleteShipmentAsync(shipment.Id, Guid.NewGuid(), CancellationToken.None);

        var auditEntry = Assert.Single(auditLogWriter.Entries);
        Assert.Equal("ShipmentCompleted", auditEntry.ActionType);
        Assert.Equal("Shipment", auditEntry.EntityType);
        Assert.Equal(shipment.Id.ToString(), auditEntry.EntityId);
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

        var repository = new InMemoryShipmentWorkflowRepository();
        return new TestFixture(repository, product, warehouse, zone, location);
    }

    private sealed record TestFixture(
        InMemoryShipmentWorkflowRepository Repository,
        Product Product,
        Warehouse Warehouse,
        Zone Zone,
        Location Location)
    {
        public PickedDemandScenario CreatePickedDemandScenario(decimal quantityPicked, decimal onHandQuantity)
        {
            var balance = new InventoryBalance
            {
                Id = Guid.NewGuid(),
                ProductId = Product.Id,
                Product = Product,
                LocationId = Location.Id,
                Location = Location,
                OnHandQuantity = onHandQuantity,
                ReservedQuantity = 0m,
                PickedQuantity = quantityPicked,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };

            var salesOrder = new SalesOrder
            {
                Id = Guid.NewGuid(),
                Status = SalesOrderStatus.FullyReserved,
                CreatedAtUtc = DateTimeOffset.UtcNow,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
                ConfirmedAtUtc = DateTimeOffset.UtcNow,
            };

            var salesOrderLine = new SalesOrderLine
            {
                Id = Guid.NewGuid(),
                SalesOrderId = salesOrder.Id,
                SalesOrder = salesOrder,
                ProductId = Product.Id,
                Product = Product,
                OrderedQuantity = quantityPicked,
                ReservedQuantity = 0m,
                PickedQuantity = quantityPicked,
            };

            var reservation = new SalesOrderReservation
            {
                Id = Guid.NewGuid(),
                SalesOrderLineId = salesOrderLine.Id,
                SalesOrderLine = salesOrderLine,
                InventoryBalanceId = balance.Id,
                InventoryBalance = balance,
                Quantity = 0m,
                PickedQuantity = quantityPicked,
                CreatedAtUtc = DateTimeOffset.UtcNow,
            };

            salesOrderLine.Reservations.Add(reservation);
            salesOrder.Lines.Add(salesOrderLine);

            var pickingTask = new PickingTask
            {
                Id = Guid.NewGuid(),
                SalesOrderId = salesOrder.Id,
                SalesOrder = salesOrder,
                Status = PickingTaskStatus.Completed,
                CreatedAtUtc = DateTimeOffset.UtcNow,
                StartedAtUtc = DateTimeOffset.UtcNow,
                CompletedAtUtc = DateTimeOffset.UtcNow,
            };

            var pickingTaskLine = new PickingTaskLine
            {
                Id = Guid.NewGuid(),
                PickingTaskId = pickingTask.Id,
                PickingTask = pickingTask,
                SalesOrderLineId = salesOrderLine.Id,
                SalesOrderLine = salesOrderLine,
                SalesOrderReservationId = reservation.Id,
                SalesOrderReservation = reservation,
                InventoryBalanceId = balance.Id,
                InventoryBalance = balance,
                QuantityToPick = quantityPicked,
                PickedQuantity = quantityPicked,
            };

            pickingTask.Lines.Add(pickingTaskLine);
            Repository.SalesOrders.Add(salesOrder);
            Repository.PickingTaskLines.Add(pickingTaskLine);

            return new PickedDemandScenario(salesOrder, salesOrderLine, reservation, balance, pickingTaskLine);
        }
    }

    private sealed record PickedDemandScenario(
        SalesOrder SalesOrder,
        SalesOrderLine SalesOrderLine,
        SalesOrderReservation Reservation,
        InventoryBalance InventoryBalance,
        PickingTaskLine PickingTaskLine);

    private sealed class InMemoryShipmentWorkflowRepository : IShipmentWorkflowRepository
    {
        public List<SalesOrder> SalesOrders { get; } = [];
        public List<PickingTaskLine> PickingTaskLines { get; } = [];
        public List<ShipmentEntity> Shipments { get; } = [];
        public List<InventoryMovement> InventoryMovements { get; } = [];
        public RecordingShipmentWorkflowTransaction Transaction { get; } = new();

        public Task<IReadOnlyList<ShipmentEntity>> ListShipmentsAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ShipmentEntity>>(Shipments);

        public Task<ShipmentEntity?> FindShipmentByIdAsync(Guid shipmentId, CancellationToken cancellationToken) =>
            Task.FromResult(Shipments.SingleOrDefault(shipment => shipment.Id == shipmentId));

        public Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
            Task.FromResult(SalesOrders.SingleOrDefault(order => order.Id == salesOrderId));

        public Task<IReadOnlyDictionary<Guid, PickingTaskLine>> FindPickingTaskLinesByIdsAsync(
            IReadOnlyCollection<Guid> pickingTaskLineIds,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, PickingTaskLine>>(PickingTaskLines
                .Where(line => pickingTaskLineIds.Contains(line.Id))
                .ToDictionary(line => line.Id));

        public Task<IReadOnlyDictionary<Guid, decimal>> ListOpenAllocatedQuantitiesByPickingTaskLineIdsAsync(
            IReadOnlyCollection<Guid> pickingTaskLineIds,
            Guid? excludedShipmentId,
            CancellationToken cancellationToken)
        {
            var quantities = Shipments
                .Where(shipment =>
                    shipment.Status != ShipmentStatus.Completed &&
                    shipment.Status != ShipmentStatus.Cancelled &&
                    (!excludedShipmentId.HasValue || shipment.Id != excludedShipmentId.Value))
                .SelectMany(shipment => shipment.Lines)
                .Where(line => pickingTaskLineIds.Contains(line.PickingTaskLineId))
                .GroupBy(line => line.PickingTaskLineId)
                .ToDictionary(group => group.Key, group => group.Sum(line => line.QuantityToShip));

            return Task.FromResult<IReadOnlyDictionary<Guid, decimal>>(quantities);
        }

        public Task<IReadOnlyDictionary<Guid, decimal>> ListCompletedShippedQuantitiesByPickingTaskLineIdsAsync(
            IReadOnlyCollection<Guid> pickingTaskLineIds,
            Guid? excludedShipmentId,
            CancellationToken cancellationToken)
        {
            var quantities = Shipments
                .Where(shipment =>
                    shipment.Status == ShipmentStatus.Completed &&
                    (!excludedShipmentId.HasValue || shipment.Id != excludedShipmentId.Value))
                .SelectMany(shipment => shipment.Lines)
                .Where(line => pickingTaskLineIds.Contains(line.PickingTaskLineId))
                .GroupBy(line => line.PickingTaskLineId)
                .ToDictionary(group => group.Key, group => group.Sum(line => line.ShippedQuantity));

            return Task.FromResult<IReadOnlyDictionary<Guid, decimal>>(quantities);
        }

        public void AddShipment(ShipmentEntity shipment) => Shipments.Add(shipment);

        public void AddInventoryMovement(InventoryMovement movement) => InventoryMovements.Add(movement);

        public Task<IShipmentWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IShipmentWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingShipmentWorkflowTransaction : IShipmentWorkflowTransaction
    {
        public bool Committed { get; private set; }

        public Task CommitAsync(CancellationToken cancellationToken)
        {
            Committed = true;
            return Task.CompletedTask;
        }

        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }

    private sealed class RecordingAuditLogWriter : IAuditLogWriter
    {
        public List<AuditLogWriteEntry> Entries { get; } = [];

        public void Write(AuditLogWriteEntry entry) => Entries.Add(entry);
    }
}
