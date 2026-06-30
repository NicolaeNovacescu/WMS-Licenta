using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Sales;
using Wms.Application.Sales.Abstractions;
using Wms.Application.Sales.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using Wms.Domain.WarehouseStructure;
using ShipmentEntity = Wms.Domain.Shipment.Shipment;
using Wms.Domain.Shipment;
using Xunit;

namespace Wms.Application.Tests.Sales;

public sealed class SalesOrderWorkflowServiceTests
{
    [Fact]
    public async Task CreateSalesOrderAsync_DoesNotChangeInventoryBeforeConfirm()
    {
        var fixture = BuildFixture();
        var service = new SalesOrderWorkflowService(fixture.Repository);

        var salesOrder = await service.CreateSalesOrderAsync(
            new CreateSalesOrderCommand(
                fixture.Customer.Id,
                [new CreateSalesOrderLineCommand(fixture.Product.Id, 5m)]),
            CancellationToken.None);

        Assert.Equal(SalesOrderStatus.Draft, salesOrder.Status);
        Assert.Single(fixture.Repository.SalesOrders);
        Assert.Equal(0m, fixture.Repository.InventoryBalances.Sum(balance => balance.ReservedQuantity));
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_UsesOnlyEligibleBalances()
    {
        var fixture = BuildFixture();
        var activePickingLocation = fixture.CreateLocation("PICK-A-02", LocationType.Picking, isActive: true, isBlocked: false);
        var blockedPickingLocation = fixture.CreateLocation("PICK-B-01", LocationType.Picking, isActive: true, isBlocked: true);
        var receivingLocation = fixture.CreateLocation("REC-A-01", LocationType.Receiving, isActive: true, isBlocked: false);
        var inactiveStagingLocation = fixture.CreateLocation("STAGE-A-02", LocationType.Staging, isActive: false, isBlocked: false);

        fixture.Repository.InventoryBalances.AddRange(
            CreateBalance(fixture.Product, activePickingLocation, 5m, 0m),
            CreateBalance(fixture.Product, blockedPickingLocation, 9m, 0m),
            CreateBalance(fixture.Product, receivingLocation, 7m, 0m),
            CreateBalance(fixture.Product, inactiveStagingLocation, 6m, 0m));

        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 6m);
        fixture.Repository.SalesOrders.Add(salesOrder);

        var service = new SalesOrderWorkflowService(fixture.Repository);

        var confirmedOrder = await service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None);

        Assert.Equal(SalesOrderStatus.PartiallyReserved, confirmedOrder.Status);
        Assert.Single(confirmedOrder.Lines[0].Reservations);
        Assert.Equal(5m, confirmedOrder.Lines[0].ReservedQuantity);
        Assert.Equal("PICK-A-02", confirmedOrder.Lines[0].Reservations[0].LocationCode);
        Assert.Equal(5m, fixture.Repository.InventoryBalances.Single(balance => balance.LocationId == activePickingLocation.Id).ReservedQuantity);
        Assert.Equal(0m, fixture.Repository.InventoryBalances.Single(balance => balance.LocationId == blockedPickingLocation.Id).ReservedQuantity);
        Assert.Equal(0m, fixture.Repository.InventoryBalances.Single(balance => balance.LocationId == receivingLocation.Id).ReservedQuantity);
        Assert.Equal(0m, fixture.Repository.InventoryBalances.Single(balance => balance.LocationId == inactiveStagingLocation.Id).ReservedQuantity);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_RetryReleasesAndReallocatesReservations()
    {
        var fixture = BuildFixture();
        var firstLocation = fixture.CreateLocation("PICK-A-02", LocationType.Picking, isActive: true, isBlocked: false);
        var secondLocation = fixture.CreateLocation("STAGE-A-02", LocationType.Staging, isActive: true, isBlocked: false);

        var firstBalance = CreateBalance(fixture.Product, firstLocation, 3m, 0m);
        var secondBalance = CreateBalance(fixture.Product, secondLocation, 0m, 0m);
        fixture.Repository.InventoryBalances.AddRange(firstBalance, secondBalance);

        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        fixture.Repository.SalesOrders.Add(salesOrder);

        var service = new SalesOrderWorkflowService(fixture.Repository);

        var firstAttempt = await service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None);

        Assert.Equal(SalesOrderStatus.PartiallyReserved, firstAttempt.Status);
        Assert.Equal(3m, firstBalance.ReservedQuantity);
        Assert.Equal(0m, secondBalance.ReservedQuantity);

        secondBalance.OnHandQuantity = 4m;

        var secondAttempt = await service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None);

        Assert.Equal(SalesOrderStatus.FullyReserved, secondAttempt.Status);
        Assert.Equal(3m, firstBalance.ReservedQuantity);
        Assert.Equal(1m, secondBalance.ReservedQuantity);
        Assert.Equal(2, secondAttempt.Lines[0].Reservations.Count);
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_RetryPersistsReservationReleaseBeforeReallocation()
    {
        var fixture = BuildFixture();
        var location = fixture.CreateLocation("PICK-A-02", LocationType.Picking, isActive: true, isBlocked: false);
        var balance = CreateBalance(fixture.Product, location, 4m, 2m);
        fixture.Repository.InventoryBalances.Add(balance);

        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        var line = salesOrder.Lines.Single();
        var reservation = new SalesOrderReservation
        {
            Id = Guid.NewGuid(),
            SalesOrderLineId = line.Id,
            SalesOrderLine = line,
            InventoryBalanceId = balance.Id,
            InventoryBalance = balance,
            Quantity = 2m,
            PickedQuantity = 0m,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        line.Reservations.Add(reservation);
        line.ReservedQuantity = 2m;
        salesOrder.Status = SalesOrderStatus.PartiallyReserved;
        salesOrder.ConfirmedAtUtc = DateTimeOffset.UtcNow;
        fixture.Repository.SalesOrders.Add(salesOrder);
        fixture.Repository.RequirePersistedReleaseBeforeCandidateLookup = true;
        fixture.Repository.RequireExplicitReservationRegistrationBeforeSave = true;

        var service = new SalesOrderWorkflowService(fixture.Repository);

        var confirmedOrder = await service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None);

        Assert.Equal(SalesOrderStatus.FullyReserved, confirmedOrder.Status);
        Assert.Equal(4m, balance.ReservedQuantity);
        Assert.Single(confirmedOrder.Lines[0].Reservations);
        var addedReservation = Assert.Single(fixture.Repository.AddedReservations);
        Assert.Equal(confirmedOrder.Lines[0].Reservations[0].Id, addedReservation.Id);
        Assert.True(fixture.Repository.SaveChangesCallCount >= 2);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_RejectsWhenCurrentReservationsAreReferencedByPickingTaskLines()
    {
        var fixture = BuildFixture();
        var location = fixture.CreateLocation("PICK-A-02", LocationType.Picking, isActive: true, isBlocked: false);
        var balance = CreateBalance(fixture.Product, location, 4m, 2m);
        fixture.Repository.InventoryBalances.Add(balance);

        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        var line = salesOrder.Lines.Single();
        var reservation = new SalesOrderReservation
        {
            Id = Guid.NewGuid(),
            SalesOrderLineId = line.Id,
            SalesOrderLine = line,
            InventoryBalanceId = balance.Id,
            InventoryBalance = balance,
            Quantity = 2m,
            PickedQuantity = 0m,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        line.Reservations.Add(reservation);
        line.ReservedQuantity = 2m;
        salesOrder.Status = SalesOrderStatus.PartiallyReserved;
        salesOrder.ConfirmedAtUtc = DateTimeOffset.UtcNow;
        fixture.Repository.SalesOrders.Add(salesOrder);

        var cancelledPickingTask = new PickingTask
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = PickingTaskStatus.Cancelled,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CancelledAtUtc = DateTimeOffset.UtcNow,
        };
        cancelledPickingTask.Lines.Add(new PickingTaskLine
        {
            Id = Guid.NewGuid(),
            PickingTaskId = cancelledPickingTask.Id,
            PickingTask = cancelledPickingTask,
            SalesOrderLineId = line.Id,
            SalesOrderLine = line,
            SalesOrderReservationId = reservation.Id,
            SalesOrderReservation = reservation,
            InventoryBalanceId = balance.Id,
            InventoryBalance = balance,
            QuantityToPick = 1m,
            PickedQuantity = 0m,
        });
        fixture.Repository.PickingTasks.Add(cancelledPickingTask);

        var service = new SalesOrderWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None));

        Assert.Equal(
            "Sales orders with picking task history cannot change reservation state because picking task lines still reference current reservations.",
            exception.Message);
        Assert.Empty(fixture.Repository.RemovedReservations);
        Assert.Equal(2m, balance.ReservedQuantity);
        Assert.False(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_WritesAuditEntry()
    {
        var fixture = BuildFixture();
        var sourceLocation = fixture.CreateLocation("PICK-A-02", LocationType.Picking, isActive: true, isBlocked: false);
        fixture.Repository.InventoryBalances.Add(CreateBalance(fixture.Product, sourceLocation, 6m, 0m));

        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        fixture.Repository.SalesOrders.Add(salesOrder);

        var auditLogWriter = new RecordingAuditLogWriter();
        var service = new SalesOrderWorkflowService(fixture.Repository, auditLogWriter);

        await service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None);

        var auditEntry = Assert.Single(auditLogWriter.Entries);
        Assert.Equal("SalesOrderConfirmed", auditEntry.ActionType);
        Assert.Equal("SalesOrder", auditEntry.EntityType);
        Assert.Equal(salesOrder.Id.ToString(), auditEntry.EntityId);
    }

    [Fact]
    public async Task CancelSalesOrderAsync_ReleasesExistingReservations()
    {
        var fixture = BuildFixture();
        var sourceLocation = fixture.CreateLocation("PICK-A-02", LocationType.Picking, isActive: true, isBlocked: false);
        var balance = CreateBalance(fixture.Product, sourceLocation, 10m, 0m);
        fixture.Repository.InventoryBalances.Add(balance);

        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 6m);
        var line = salesOrder.Lines.Single();
        var reservation = new SalesOrderReservation
        {
            Id = Guid.NewGuid(),
            SalesOrderLineId = line.Id,
            SalesOrderLine = line,
            InventoryBalanceId = balance.Id,
            InventoryBalance = balance,
            Quantity = 6m,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        line.Reservations.Add(reservation);
        line.ReservedQuantity = 6m;
        balance.ReservedQuantity = 6m;
        salesOrder.Status = SalesOrderStatus.FullyReserved;
        salesOrder.ConfirmedAtUtc = DateTimeOffset.UtcNow;
        fixture.Repository.SalesOrders.Add(salesOrder);

        var service = new SalesOrderWorkflowService(fixture.Repository);

        var cancelledOrder = await service.CancelSalesOrderAsync(salesOrder.Id, CancellationToken.None);

        Assert.Equal(SalesOrderStatus.Cancelled, cancelledOrder.Status);
        Assert.Equal(0m, balance.ReservedQuantity);
        Assert.Empty(line.Reservations);
        Assert.True(fixture.Repository.RemovedReservations.Count > 0);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_RejectsFullyReservedOrder()
    {
        var fixture = BuildFixture();
        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        salesOrder.Status = SalesOrderStatus.FullyReserved;
        salesOrder.ConfirmedAtUtc = DateTimeOffset.UtcNow;
        fixture.Repository.SalesOrders.Add(salesOrder);

        var service = new SalesOrderWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None));
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_RejectsWhenOrderAlreadyHasPickedQuantity()
    {
        var fixture = BuildFixture();
        var sourceLocation = fixture.CreateLocation("PICK-A-02", LocationType.Picking, isActive: true, isBlocked: false);
        var balance = CreateBalance(fixture.Product, sourceLocation, 10m, 2m);
        balance.PickedQuantity = 4m;
        fixture.Repository.InventoryBalances.Add(balance);

        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 6m);
        var line = salesOrder.Lines.Single();
        line.ReservedQuantity = 2m;
        line.PickedQuantity = 4m;
        line.Reservations.Add(new SalesOrderReservation
        {
            Id = Guid.NewGuid(),
            SalesOrderLineId = line.Id,
            SalesOrderLine = line,
            InventoryBalanceId = balance.Id,
            InventoryBalance = balance,
            Quantity = 2m,
            PickedQuantity = 4m,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        salesOrder.Status = SalesOrderStatus.PartiallyReserved;
        fixture.Repository.SalesOrders.Add(salesOrder);

        var service = new SalesOrderWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None));
    }

    [Fact]
    public async Task CancelSalesOrderAsync_RejectsWhenActivePickingTaskExists()
    {
        var fixture = BuildFixture();
        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        salesOrder.Status = SalesOrderStatus.PartiallyReserved;
        fixture.Repository.SalesOrders.Add(salesOrder);
        fixture.Repository.PickingTasks.Add(new PickingTask
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = PickingTaskStatus.Pending,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new SalesOrderWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CancelSalesOrderAsync(salesOrder.Id, CancellationToken.None));
    }

    [Fact]
    public async Task ConfirmSalesOrderAsync_RejectsWhenShipmentExecutionExists()
    {
        var fixture = BuildFixture();
        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        salesOrder.Status = SalesOrderStatus.Confirmed;
        fixture.Repository.SalesOrders.Add(salesOrder);
        fixture.Repository.Shipments.Add(new ShipmentEntity
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = ShipmentStatus.Completed,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CompletedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new SalesOrderWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ConfirmSalesOrderAsync(salesOrder.Id, CancellationToken.None));
    }

    [Fact]
    public async Task CancelSalesOrderAsync_RejectsWhenShipmentExecutionExists()
    {
        var fixture = BuildFixture();
        var salesOrder = CreateSalesOrder(fixture.Customer, fixture.Product, 4m);
        salesOrder.Status = SalesOrderStatus.Confirmed;
        fixture.Repository.SalesOrders.Add(salesOrder);
        fixture.Repository.Shipments.Add(new ShipmentEntity
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = ShipmentStatus.Pending,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        var service = new SalesOrderWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CancelSalesOrderAsync(salesOrder.Id, CancellationToken.None));
    }

    private static InventoryBalance CreateBalance(Product product, Location location, decimal onHandQuantity, decimal reservedQuantity) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Product = product,
            LocationId = location.Id,
            Location = location,
            OnHandQuantity = onHandQuantity,
            ReservedQuantity = reservedQuantity,
            PickedQuantity = 0m,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

    [Fact]
    public async Task CreateSalesOrderAsync_RejectsInactiveCustomer()
    {
        var fixture = BuildFixture();
        fixture.Customer.IsActive = false;
        var service = new SalesOrderWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateSalesOrderAsync(
                new CreateSalesOrderCommand(
                    fixture.Customer.Id,
                    [new CreateSalesOrderLineCommand(fixture.Product.Id, 5m)]),
                CancellationToken.None));
    }

    private static SalesOrder CreateSalesOrder(Customer customer, Product product, decimal orderedQuantity)
    {
        var salesOrder = new SalesOrder
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            Customer = customer,
            Status = SalesOrderStatus.Draft,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

        salesOrder.Lines.Add(new SalesOrderLine
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            ProductId = product.Id,
            Product = product,
            OrderedQuantity = orderedQuantity,
            ReservedQuantity = 0m,
            PickedQuantity = 0m,
        });

        return salesOrder;
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

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = "CUST-ALPHA",
            Name = "Demo Customer Alpha",
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

        var receivingZone = new Zone
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            Code = "RECV",
            Name = "Receiving",
            IsActive = true,
        };

        return new TestFixture(
            new InMemorySalesOrderWorkflowRepository([product], [customer]),
            customer,
            product,
            warehouse,
            pickingZone,
            stagingZone,
            receivingZone);
    }

    private sealed record TestFixture(
        InMemorySalesOrderWorkflowRepository Repository,
        Customer Customer,
        Product Product,
        Warehouse Warehouse,
        Zone PickingZone,
        Zone StagingZone,
        Zone ReceivingZone)
    {
        public Location CreateLocation(string code, string locationType, bool isActive, bool isBlocked)
        {
            var zone = locationType switch
            {
                LocationType.Picking => PickingZone,
                LocationType.Receiving => ReceivingZone,
                _ => StagingZone,
            };

            var location = new Location
            {
                Id = Guid.NewGuid(),
                WarehouseId = Warehouse.Id,
                Warehouse = Warehouse,
                ZoneId = zone.Id,
                Zone = zone,
                Code = code,
                Name = code,
                LocationType = locationType,
                IsActive = isActive,
                IsBlocked = isBlocked,
                MapRow = 0,
                MapColumn = 0,
            };

            Repository.Locations.Add(location);
            return location;
        }
    }

    private sealed class InMemorySalesOrderWorkflowRepository(
        IReadOnlyList<Product> products,
        IReadOnlyList<Customer> customers) : ISalesOrderWorkflowRepository
    {
        private readonly List<Product> _products = [.. products];
        private readonly List<Customer> _customers = [.. customers];

        public List<SalesOrder> SalesOrders { get; } = [];
        public List<Location> Locations { get; } = [];
        public List<InventoryBalance> InventoryBalances { get; } = [];
        public List<PickingTask> PickingTasks { get; } = [];
        public List<ShipmentEntity> Shipments { get; } = [];
        public List<SalesOrderReservation> AddedReservations { get; } = [];
        public List<SalesOrderReservation> RemovedReservations { get; } = [];
        public RecordingSalesOrderWorkflowTransaction Transaction { get; } = new();
        public bool RequirePersistedReleaseBeforeCandidateLookup { get; set; }
        public bool RequireExplicitReservationRegistrationBeforeSave { get; set; }
        public int SaveChangesCallCount { get; private set; }
        private bool _hasUnpersistedReservationRelease;

        public Task<IReadOnlyList<SalesOrder>> ListSalesOrdersAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<SalesOrder>>(SalesOrders);

        public Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
            Task.FromResult(SalesOrders.SingleOrDefault(salesOrder => salesOrder.Id == salesOrderId));

        public Task<Customer?> FindCustomerByIdAsync(Guid customerId, CancellationToken cancellationToken) =>
            Task.FromResult(_customers.SingleOrDefault(customer => customer.Id == customerId));

        public Task<IReadOnlyDictionary<Guid, Product>> FindProductsByIdsAsync(
            IReadOnlyCollection<Guid> productIds,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, Product>>(_products
                .Where(product => productIds.Contains(product.Id))
                .ToDictionary(product => product.Id));

        public Task<IReadOnlyList<InventoryBalance>> ListEligibleReservationBalancesAsync(
            IReadOnlyCollection<Guid> productIds,
            CancellationToken cancellationToken)
        {
            if (RequirePersistedReleaseBeforeCandidateLookup && _hasUnpersistedReservationRelease)
            {
                throw new InvalidOperationException(
                    "Reservation candidate lookup occurred before the previous reservation release was persisted.");
            }

            return Task.FromResult<IReadOnlyList<InventoryBalance>>(InventoryBalances
                    .Where(balance =>
                        productIds.Contains(balance.ProductId) &&
                        balance.Location.IsActive &&
                        !balance.Location.IsBlocked &&
                        !string.Equals(balance.Location.LocationType, LocationType.Receiving, StringComparison.Ordinal) &&
                        balance.AvailableQuantity > 0m)
                    .ToArray());
        }

        public Task<bool> HasOpenPickingTasksAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
            Task.FromResult(PickingTasks.Any(task =>
                task.SalesOrderId == salesOrderId &&
                (task.Status == PickingTaskStatus.Pending || task.Status == PickingTaskStatus.InProgress)));

        public Task<bool> HasPickingTaskLineReferencesAsync(
            IReadOnlyCollection<Guid> salesOrderReservationIds,
            CancellationToken cancellationToken) =>
            Task.FromResult(PickingTasks
                .SelectMany(task => task.Lines)
                .Any(line => salesOrderReservationIds.Contains(line.SalesOrderReservationId)));

        public Task<bool> HasShipmentExecutionAsync(Guid salesOrderId, CancellationToken cancellationToken) =>
            Task.FromResult(Shipments.Any(shipment =>
                shipment.SalesOrderId == salesOrderId &&
                shipment.Status != ShipmentStatus.Cancelled));

        public void AddSalesOrder(SalesOrder salesOrder) => SalesOrders.Add(salesOrder);

        public void AddSalesOrderReservations(IEnumerable<SalesOrderReservation> salesOrderReservations) =>
            AddedReservations.AddRange(salesOrderReservations);

        public void RemoveSalesOrderLines(IEnumerable<SalesOrderLine> salesOrderLines)
        {
            var lines = salesOrderLines.ToArray();
            foreach (var salesOrder in SalesOrders)
            {
                foreach (var line in lines)
                {
                    salesOrder.Lines.Remove(line);
                }
            }
        }

        public void RemoveSalesOrderReservations(IEnumerable<SalesOrderReservation> salesOrderReservations)
        {
            var reservations = salesOrderReservations.ToArray();
            RemovedReservations.AddRange(reservations);
            _hasUnpersistedReservationRelease = _hasUnpersistedReservationRelease || reservations.Length > 0;

            foreach (var salesOrder in SalesOrders)
            {
                foreach (var line in salesOrder.Lines)
                {
                    foreach (var reservation in reservations)
                    {
                        line.Reservations.Remove(reservation);
                    }
                }
            }
        }

        public Task<ISalesOrderWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<ISalesOrderWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            if (RequireExplicitReservationRegistrationBeforeSave)
            {
                var unregisteredReservations = SalesOrders
                    .SelectMany(salesOrder => salesOrder.Lines)
                    .SelectMany(line => line.Reservations)
                    .Where(reservation => !AddedReservations.Contains(reservation))
                    .ToArray();

                if (unregisteredReservations.Length > 0)
                {
                    throw new InvalidOperationException(
                        "New sales order reservations must be explicitly registered before save.");
                }
            }

            SaveChangesCallCount++;
            _hasUnpersistedReservationRelease = false;
            return Task.CompletedTask;
        }
    }

    private sealed class RecordingSalesOrderWorkflowTransaction : ISalesOrderWorkflowTransaction
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
