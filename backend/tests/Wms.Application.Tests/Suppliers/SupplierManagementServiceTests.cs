using Wms.Application.Suppliers;
using Wms.Application.Suppliers.Abstractions;
using Wms.Application.Suppliers.Models;
using Wms.Domain.Inbound;
using Xunit;

namespace Wms.Application.Tests.Suppliers;

public sealed class SupplierManagementServiceTests
{
    [Fact]
    public async Task CreateSupplierAsync_CreatesActiveSupplier()
    {
        var repository = new InMemorySupplierManagementRepository();
        var service = new SupplierManagementService(repository);

        var supplier = await service.CreateSupplierAsync(
            new CreateSupplierCommand(" SUP-GAMMA ", " Demo Supplier Gamma "),
            CancellationToken.None);

        Assert.Equal("SUP-GAMMA", supplier.Code);
        Assert.Equal("Demo Supplier Gamma", supplier.Name);
        Assert.True(supplier.IsActive);
        Assert.Single(repository.Suppliers);
    }

    [Fact]
    public async Task CreateSupplierAsync_RejectsDuplicateCodeIgnoringCase()
    {
        var repository = new InMemorySupplierManagementRepository(
            new Supplier
            {
                Id = Guid.NewGuid(),
                Code = "SUP-ALPHA",
                Name = "Demo Supplier Alpha",
                IsActive = true,
            });
        var service = new SupplierManagementService(repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateSupplierAsync(
                new CreateSupplierCommand("sup-alpha", "Another Supplier"),
                CancellationToken.None));

        Assert.Contains("already in use", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateSupplierAsync_RejectsDuplicateCodeIgnoringCase()
    {
        var firstSupplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "SUP-ALPHA",
            Name = "Demo Supplier Alpha",
            IsActive = true,
        };
        var secondSupplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "SUP-BETA",
            Name = "Demo Supplier Beta",
            IsActive = true,
        };
        var repository = new InMemorySupplierManagementRepository(firstSupplier, secondSupplier);
        var service = new SupplierManagementService(repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateSupplierAsync(
                secondSupplier.Id,
                new UpdateSupplierCommand(" sup-alpha ", "Updated Beta"),
                CancellationToken.None));

        Assert.Contains("already in use", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ActivateSupplierAsync_ActivatesInactiveSupplier()
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "SUP-INACTIVE",
            Name = "Inactive Supplier",
            IsActive = false,
        };
        var repository = new InMemorySupplierManagementRepository(supplier);
        var service = new SupplierManagementService(repository);

        var result = await service.ActivateSupplierAsync(supplier.Id, CancellationToken.None);

        Assert.True(result.IsActive);
        Assert.True(repository.Suppliers[0].IsActive);
    }

    [Fact]
    public async Task GetSupplierByIdAsync_ReturnsInboundUsageSummary()
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "SUP-ACTIVE",
            Name = "Active Supplier",
            IsActive = true,
        };
        var repository = new InMemorySupplierManagementRepository(supplier);
        repository.InboundOrders.AddRange(
        [
            new InboundOrder
            {
                Id = Guid.NewGuid(),
                SupplierId = supplier.Id,
                Supplier = supplier,
                Status = InboundOrderStatus.Draft,
            },
            new InboundOrder
            {
                Id = Guid.NewGuid(),
                SupplierId = supplier.Id,
                Supplier = supplier,
                Status = InboundOrderStatus.PartiallyReceived,
            },
            new InboundOrder
            {
                Id = Guid.NewGuid(),
                SupplierId = supplier.Id,
                Supplier = supplier,
                Status = InboundOrderStatus.FullyReceived,
            },
            new InboundOrder
            {
                Id = Guid.NewGuid(),
                SupplierId = Guid.NewGuid(),
                Supplier = new Supplier
                {
                    Id = Guid.NewGuid(),
                    Code = "SUP-OTHER",
                    Name = "Other Supplier",
                    IsActive = true,
                },
                Status = InboundOrderStatus.Draft,
            },
        ]);
        var service = new SupplierManagementService(repository);

        var result = await service.GetSupplierByIdAsync(supplier.Id, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(3, result.ReferencedInboundOrderCount);
        Assert.Equal(2, result.ActiveReferencedInboundOrderCount);
    }

    [Fact]
    public async Task DeactivateSupplierAsync_DeactivatesActiveSupplier()
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "SUP-ACTIVE",
            Name = "Active Supplier",
            IsActive = true,
        };
        var repository = new InMemorySupplierManagementRepository(supplier);
        var service = new SupplierManagementService(repository);

        var result = await service.DeactivateSupplierAsync(supplier.Id, CancellationToken.None);

        Assert.False(result.IsActive);
        Assert.False(repository.Suppliers[0].IsActive);
    }

    [Fact]
    public async Task DeactivateSupplierAsync_AllowsReferencedSupplier()
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = "SUP-ACTIVE",
            Name = "Active Supplier",
            IsActive = true,
        };
        var repository = new InMemorySupplierManagementRepository(supplier);
        repository.InboundOrders.Add(
            new InboundOrder
            {
                Id = Guid.NewGuid(),
                SupplierId = supplier.Id,
                Supplier = supplier,
                Status = InboundOrderStatus.ReadyForReceipt,
            });
        var service = new SupplierManagementService(repository);

        var result = await service.DeactivateSupplierAsync(supplier.Id, CancellationToken.None);

        Assert.False(result.IsActive);
        Assert.False(repository.Suppliers[0].IsActive);
    }

    private sealed class InMemorySupplierManagementRepository(params Supplier[] suppliers)
        : ISupplierManagementRepository
    {
        public List<Supplier> Suppliers { get; } = [.. suppliers];
        public List<InboundOrder> InboundOrders { get; } = [];

        public Task<IReadOnlyList<Supplier>> ListSuppliersAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Supplier>>(
                Suppliers
                    .OrderBy(supplier => supplier.Code, StringComparer.OrdinalIgnoreCase)
                    .ThenBy(supplier => supplier.Name, StringComparer.OrdinalIgnoreCase)
                    .ToArray());

        public Task<Supplier?> FindSupplierByIdAsync(Guid supplierId, CancellationToken cancellationToken) =>
            Task.FromResult(Suppliers.SingleOrDefault(supplier => supplier.Id == supplierId));

        public Task<(int TotalReferencedInboundOrders, int ActiveReferencedInboundOrders)> GetSupplierUsageAsync(
            Guid supplierId,
            CancellationToken cancellationToken)
        {
            var referencedOrders = InboundOrders.Where(order => order.SupplierId == supplierId).ToArray();
            return Task.FromResult((
                referencedOrders.Length,
                referencedOrders.Count(order =>
                    order.Status != InboundOrderStatus.FullyReceived &&
                    order.Status != InboundOrderStatus.Cancelled)));
        }

        public Task<bool> SupplierCodeExistsAsync(
            string code,
            Guid? excludedSupplierId,
            CancellationToken cancellationToken) =>
            Task.FromResult(Suppliers.Any(supplier =>
                string.Equals(supplier.Code, code, StringComparison.OrdinalIgnoreCase) &&
                (!excludedSupplierId.HasValue || supplier.Id != excludedSupplierId.Value)));

        public void AddSupplier(Supplier supplier) => Suppliers.Add(supplier);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
