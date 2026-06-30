using Wms.Application.Inbound;
using Wms.Application.Inbound.Abstractions;
using Wms.Application.Inbound.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;
using Xunit;

namespace Wms.Application.Tests.Inbound;

public sealed class InboundWorkflowServiceTests
{
    [Fact]
    public async Task CreateReceiptAsync_DoesNotChangeStockBeforeConfirmation()
    {
        var fixture = BuildFixture();
        fixture.InboundOrder.Status = InboundOrderStatus.ReadyForReceipt;

        var service = new InboundWorkflowService(fixture.Repository);

        var receipt = await service.CreateReceiptAsync(
            new CreateReceiptCommand(
                fixture.InboundOrder.Id,
                "Receiving demo stock",
                [
                    new CreateReceiptLineCommand(
                        fixture.InboundOrderLine.Id,
                        fixture.ReceivingLocation.Id,
                        4m),
                ]),
            CancellationToken.None);

        Assert.Equal(ReceiptStatus.Draft, receipt.Status);
        Assert.Empty(fixture.Repository.InventoryBalances);
        Assert.Empty(fixture.Repository.InventoryMovements);
        Assert.Single(fixture.Repository.Receipts);
    }

    [Fact]
    public async Task ConfirmReceiptAsync_UpdatesBalancesMovementsAndStatusesTransactionally()
    {
        var fixture = BuildFixture();
        fixture.InboundOrder.Status = InboundOrderStatus.ReadyForReceipt;

        var receipt = new Receipt
        {
            Id = Guid.NewGuid(),
            InboundOrderId = fixture.InboundOrder.Id,
            InboundOrder = fixture.InboundOrder,
            Status = ReceiptStatus.InProgress,
            Notes = "Confirmed receipt",
            CreatedAtUtc = new DateTimeOffset(2026, 3, 14, 11, 0, 0, TimeSpan.Zero),
            StartedAtUtc = new DateTimeOffset(2026, 3, 14, 11, 5, 0, TimeSpan.Zero),
            Lines =
            [
                new ReceiptLine
                {
                    Id = Guid.NewGuid(),
                    InboundOrderLineId = fixture.InboundOrderLine.Id,
                    InboundOrderLine = fixture.InboundOrderLine,
                    ReceivingLocationId = fixture.ReceivingLocation.Id,
                    ReceivingLocation = fixture.ReceivingLocation,
                    Quantity = 6m,
                },
            ],
        };

        fixture.Repository.Receipts.Add(receipt);

        var service = new InboundWorkflowService(fixture.Repository);
        var currentUserId = Guid.NewGuid();

        var confirmedReceipt = await service.ConfirmReceiptAsync(
            receipt.Id,
            currentUserId,
            CancellationToken.None);

        Assert.Equal(ReceiptStatus.Confirmed, confirmedReceipt.Status);
        Assert.Equal(InboundOrderStatus.PartiallyReceived, confirmedReceipt.InboundOrderStatus);
        Assert.Equal(6m, fixture.InboundOrderLine.ReceivedQuantity);
        Assert.Single(fixture.Repository.InventoryBalances);
        Assert.Equal(6m, fixture.Repository.InventoryBalances[0].OnHandQuantity);
        Assert.Single(fixture.Repository.InventoryMovements);
        Assert.Equal(InventoryMovementType.Addition, fixture.Repository.InventoryMovements[0].MovementType);
        Assert.Equal("Receipt", fixture.Repository.InventoryMovements[0].ReferenceType);
        Assert.Equal(receipt.Id.ToString(), fixture.Repository.InventoryMovements[0].ReferenceId);
        Assert.Equal(currentUserId, fixture.Repository.InventoryMovements[0].PerformedByUserId);
        Assert.True(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task ConfirmReceiptAsync_RejectsOverReceipt()
    {
        var fixture = BuildFixture();
        fixture.InboundOrder.Status = InboundOrderStatus.ReadyForReceipt;
        fixture.InboundOrderLine.ExpectedQuantity = 5m;
        fixture.InboundOrderLine.ReceivedQuantity = 4m;

        var receipt = new Receipt
        {
            Id = Guid.NewGuid(),
            InboundOrderId = fixture.InboundOrder.Id,
            InboundOrder = fixture.InboundOrder,
            Status = ReceiptStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
            Lines =
            [
                new ReceiptLine
                {
                    Id = Guid.NewGuid(),
                    InboundOrderLineId = fixture.InboundOrderLine.Id,
                    InboundOrderLine = fixture.InboundOrderLine,
                    ReceivingLocationId = fixture.ReceivingLocation.Id,
                    ReceivingLocation = fixture.ReceivingLocation,
                    Quantity = 2m,
                },
            ],
        };

        fixture.Repository.Receipts.Add(receipt);
        var service = new InboundWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ConfirmReceiptAsync(receipt.Id, Guid.NewGuid(), CancellationToken.None));

        Assert.Contains("remaining expected quantity", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.False(fixture.Repository.Transaction.Committed);
        Assert.Empty(fixture.Repository.InventoryMovements);
    }

    [Fact]
    public async Task ConfirmReceiptAsync_RequiresReceivingLocationToBeReceivingAndUnblocked()
    {
        var fixture = BuildFixture();
        fixture.InboundOrder.Status = InboundOrderStatus.ReadyForReceipt;
        fixture.ReceivingLocation.LocationType = LocationType.Picking;

        var receipt = new Receipt
        {
            Id = Guid.NewGuid(),
            InboundOrderId = fixture.InboundOrder.Id,
            InboundOrder = fixture.InboundOrder,
            Status = ReceiptStatus.InProgress,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            StartedAtUtc = DateTimeOffset.UtcNow,
            Lines =
            [
                new ReceiptLine
                {
                    Id = Guid.NewGuid(),
                    InboundOrderLineId = fixture.InboundOrderLine.Id,
                    InboundOrderLine = fixture.InboundOrderLine,
                    ReceivingLocationId = fixture.ReceivingLocation.Id,
                    ReceivingLocation = fixture.ReceivingLocation,
                    Quantity = 2m,
                },
            ],
        };

        fixture.Repository.Receipts.Add(receipt);
        var service = new InboundWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ConfirmReceiptAsync(receipt.Id, Guid.NewGuid(), CancellationToken.None));

        Assert.Contains(LocationType.Receiving, exception.Message, StringComparison.Ordinal);
        Assert.False(fixture.Repository.Transaction.Committed);
    }

    [Fact]
    public async Task CancelInboundOrderAsync_RejectsCancellationWhenConfirmedQuantityExists()
    {
        var fixture = BuildFixture();
        fixture.InboundOrderLine.ReceivedQuantity = 1m;

        var service = new InboundWorkflowService(fixture.Repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CancelInboundOrderAsync(fixture.InboundOrder.Id, CancellationToken.None));
    }

    [Fact]
    public async Task CreateInboundOrderAsync_RejectsInactiveSupplier()
    {
        var fixture = BuildFixture();
        fixture.Supplier.IsActive = false;

        var service = new InboundWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateInboundOrderAsync(
                new CreateInboundOrderCommand(
                    fixture.Supplier.Id,
                    "INV-2026-NEW",
                    null,
                    [new CreateInboundOrderLineCommand(fixture.Product.Id, 3m)]),
                CancellationToken.None));

        Assert.Contains("inactive", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateInboundOrderAsync_RejectsInactiveSupplier()
    {
        var fixture = BuildFixture();
        fixture.Supplier.IsActive = false;

        var service = new InboundWorkflowService(fixture.Repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateInboundOrderAsync(
                fixture.InboundOrder.Id,
                new UpdateInboundOrderCommand(
                    fixture.Supplier.Id,
                    "INV-2026-UPDATED",
                    "Updated notes",
                    [new CreateInboundOrderLineCommand(fixture.Product.Id, 5m)]),
                CancellationToken.None));

        Assert.Contains("inactive", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static TestFixture BuildFixture()
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "SUP-ALPHA",
            Name = "Demo Supplier Alpha",
            IsActive = true,
        };

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = "FG-1000",
            Name = "Demo Finished Product",
            Barcode = "5940000000011",
            Description = "Demo Finished Product",
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
            Code = "RECV",
            Name = "Receiving",
            IsActive = true,
        };

        var receivingLocation = new Location
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouse.Id,
            Warehouse = warehouse,
            ZoneId = zone.Id,
            Zone = zone,
            Code = "REC-A-01",
            Name = "Receiving A-01",
            LocationType = LocationType.Receiving,
            IsActive = true,
            IsBlocked = false,
            MapRow = 0,
            MapColumn = 0,
        };

        var inboundOrder = new InboundOrder
        {
            Id = Guid.NewGuid(),
            SupplierId = supplier.Id,
            Supplier = supplier,
            SupplierInvoiceReference = "INV-2026-0001",
            Status = InboundOrderStatus.Draft,
            Notes = "Demo inbound order",
            CreatedAtUtc = DateTimeOffset.UtcNow,
            UpdatedAtUtc = DateTimeOffset.UtcNow,
        };

        var inboundOrderLine = new InboundOrderLine
        {
            Id = Guid.NewGuid(),
            InboundOrderId = inboundOrder.Id,
            InboundOrder = inboundOrder,
            ProductId = product.Id,
            Product = product,
            ExpectedQuantity = 10m,
            ReceivedQuantity = 0m,
        };

        inboundOrder.Lines.Add(inboundOrderLine);

        var repository = new InMemoryInboundWorkflowRepository(
            [supplier],
            [product],
            [receivingLocation],
            [inboundOrder]);

        return new TestFixture(repository, supplier, product, receivingLocation, inboundOrder, inboundOrderLine);
    }

    private sealed record TestFixture(
        InMemoryInboundWorkflowRepository Repository,
        Supplier Supplier,
        Product Product,
        Location ReceivingLocation,
        InboundOrder InboundOrder,
        InboundOrderLine InboundOrderLine);

    private sealed class InMemoryInboundWorkflowRepository(
        IReadOnlyList<Supplier> suppliers,
        IReadOnlyList<Product> products,
        IReadOnlyList<Location> locations,
        IReadOnlyList<InboundOrder> inboundOrders) : IInboundWorkflowRepository
    {
        private readonly List<Supplier> _suppliers = [.. suppliers];
        private readonly List<Product> _products = [.. products];
        private readonly List<Location> _locations = [.. locations];
        private readonly List<InboundOrder> _inboundOrders = [.. inboundOrders];

        public List<Receipt> Receipts { get; } = [];
        public List<InventoryBalance> InventoryBalances { get; } = [];
        public List<InventoryMovement> InventoryMovements { get; } = [];
        public RecordingInboundWorkflowTransaction Transaction { get; } = new();

        public Task<IReadOnlyList<InboundOrder>> ListInboundOrdersAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<InboundOrder>>(_inboundOrders);

        public Task<InboundOrder?> FindInboundOrderByIdAsync(Guid inboundOrderId, CancellationToken cancellationToken) =>
            Task.FromResult(_inboundOrders.SingleOrDefault(order => order.Id == inboundOrderId));

        public Task<Supplier?> FindSupplierByIdAsync(Guid supplierId, CancellationToken cancellationToken) =>
            Task.FromResult(_suppliers.SingleOrDefault(supplier => supplier.Id == supplierId));

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

        public void AddInboundOrder(InboundOrder inboundOrder) => _inboundOrders.Add(inboundOrder);

        public void RemoveInboundOrderLines(IEnumerable<InboundOrderLine> lines)
        {
        }

        public Task<IReadOnlyList<Receipt>> ListReceiptsAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Receipt>>(Receipts);

        public Task<Receipt?> FindReceiptByIdAsync(Guid receiptId, CancellationToken cancellationToken) =>
            Task.FromResult(Receipts.SingleOrDefault(receipt => receipt.Id == receiptId));

        public void AddReceipt(Receipt receipt) => Receipts.Add(receipt);

        public Task<InventoryBalance?> FindInventoryBalanceAsync(
            Guid productId,
            Guid locationId,
            CancellationToken cancellationToken) =>
            Task.FromResult(InventoryBalances.SingleOrDefault(balance =>
                balance.ProductId == productId &&
                balance.LocationId == locationId));

        public void AddInventoryBalance(InventoryBalance balance) => InventoryBalances.Add(balance);

        public void AddInventoryMovement(InventoryMovement movement) => InventoryMovements.Add(movement);

        public Task<IInboundWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IInboundWorkflowTransaction>(Transaction);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingInboundWorkflowTransaction : IInboundWorkflowTransaction
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
