using Wms.Application.Customers;
using Wms.Application.Customers.Abstractions;
using Wms.Application.Customers.Models;
using Wms.Domain.Sales;
using Xunit;

namespace Wms.Application.Tests.Customers;

public sealed class CustomerManagementServiceTests
{
    [Fact]
    public async Task CreateCustomerAsync_CreatesActiveCustomer()
    {
        var repository = new InMemoryCustomerManagementRepository();
        var service = new CustomerManagementService(repository);

        var customer = await service.CreateCustomerAsync(
            new CreateCustomerCommand(" CUST-GAMMA ", " Demo Customer Gamma "),
            CancellationToken.None);

        Assert.Equal("CUST-GAMMA", customer.Code);
        Assert.Equal("Demo Customer Gamma", customer.Name);
        Assert.True(customer.IsActive);
        Assert.Single(repository.Customers);
    }

    [Fact]
    public async Task CreateCustomerAsync_RejectsDuplicateCodeIgnoringCase()
    {
        var repository = new InMemoryCustomerManagementRepository(
            new Customer
            {
                Id = Guid.NewGuid(),
                Code = "CUST-ALPHA",
                Name = "Demo Customer Alpha",
                IsActive = true,
            });
        var service = new CustomerManagementService(repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateCustomerAsync(
                new CreateCustomerCommand("cust-alpha", "Another Customer"),
                CancellationToken.None));

        Assert.Contains("already in use", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateCustomerAsync_RejectsDuplicateCodeIgnoringCase()
    {
        var firstCustomer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = "CUST-ALPHA",
            Name = "Demo Customer Alpha",
            IsActive = true,
        };
        var secondCustomer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = "CUST-BETA",
            Name = "Demo Customer Beta",
            IsActive = true,
        };
        var repository = new InMemoryCustomerManagementRepository(firstCustomer, secondCustomer);
        var service = new CustomerManagementService(repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateCustomerAsync(
                secondCustomer.Id,
                new UpdateCustomerCommand(" cust-alpha ", "Updated Beta"),
                CancellationToken.None));

        Assert.Contains("already in use", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ActivateCustomerAsync_ActivatesInactiveCustomer()
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = "CUST-INACTIVE",
            Name = "Inactive Customer",
            IsActive = false,
        };
        var repository = new InMemoryCustomerManagementRepository(customer);
        var service = new CustomerManagementService(repository);

        var result = await service.ActivateCustomerAsync(customer.Id, CancellationToken.None);

        Assert.True(result.IsActive);
        Assert.True(repository.Customers[0].IsActive);
    }

    [Fact]
    public async Task GetCustomerByIdAsync_ReturnsSalesOrderUsageSummary()
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = "CUST-ACTIVE",
            Name = "Active Customer",
            IsActive = true,
        };
        var repository = new InMemoryCustomerManagementRepository(customer);
        repository.SalesOrders.AddRange(
        [
            new SalesOrder
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                Customer = customer,
                Status = SalesOrderStatus.Draft,
            },
            new SalesOrder
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                Customer = customer,
                Status = SalesOrderStatus.FullyReserved,
            },
            new SalesOrder
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                Customer = customer,
                Status = SalesOrderStatus.Cancelled,
            },
            new SalesOrder
            {
                Id = Guid.NewGuid(),
                CustomerId = null,
                Status = SalesOrderStatus.Draft,
            },
        ]);
        var service = new CustomerManagementService(repository);

        var result = await service.GetCustomerByIdAsync(customer.Id, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(3, result.ReferencedSalesOrderCount);
        Assert.Equal(2, result.ActiveReferencedSalesOrderCount);
    }

    [Fact]
    public async Task DeactivateCustomerAsync_DeactivatesActiveCustomer()
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = "CUST-ACTIVE",
            Name = "Active Customer",
            IsActive = true,
        };
        var repository = new InMemoryCustomerManagementRepository(customer);
        var service = new CustomerManagementService(repository);

        var result = await service.DeactivateCustomerAsync(customer.Id, CancellationToken.None);

        Assert.False(result.IsActive);
        Assert.False(repository.Customers[0].IsActive);
    }

    [Fact]
    public async Task DeactivateCustomerAsync_AllowsReferencedCustomer()
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = "CUST-ACTIVE",
            Name = "Active Customer",
            IsActive = true,
        };
        var repository = new InMemoryCustomerManagementRepository(customer);
        repository.SalesOrders.Add(
            new SalesOrder
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                Customer = customer,
                Status = SalesOrderStatus.Confirmed,
            });
        var service = new CustomerManagementService(repository);

        var result = await service.DeactivateCustomerAsync(customer.Id, CancellationToken.None);

        Assert.False(result.IsActive);
        Assert.False(repository.Customers[0].IsActive);
    }

    private sealed class InMemoryCustomerManagementRepository(params Customer[] customers)
        : ICustomerManagementRepository
    {
        public List<Customer> Customers { get; } = [.. customers];
        public List<SalesOrder> SalesOrders { get; } = [];

        public Task<IReadOnlyList<Customer>> ListCustomersAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Customer>>(
                Customers
                    .OrderBy(customer => customer.Code, StringComparer.OrdinalIgnoreCase)
                    .ThenBy(customer => customer.Name, StringComparer.OrdinalIgnoreCase)
                    .ToArray());

        public Task<Customer?> FindCustomerByIdAsync(Guid customerId, CancellationToken cancellationToken) =>
            Task.FromResult(Customers.SingleOrDefault(customer => customer.Id == customerId));

        public Task<(int TotalReferencedSalesOrders, int ActiveReferencedSalesOrders)> GetCustomerUsageAsync(
            Guid customerId,
            CancellationToken cancellationToken)
        {
            var referencedOrders = SalesOrders.Where(order => order.CustomerId == customerId).ToArray();
            return Task.FromResult((
                referencedOrders.Length,
                referencedOrders.Count(order => order.Status != SalesOrderStatus.Cancelled)));
        }

        public Task<bool> CustomerCodeExistsAsync(
            string code,
            Guid? excludedCustomerId,
            CancellationToken cancellationToken) =>
            Task.FromResult(Customers.Any(customer =>
                string.Equals(customer.Code, code, StringComparison.OrdinalIgnoreCase) &&
                (!excludedCustomerId.HasValue || customer.Id != excludedCustomerId.Value)));

        public void AddCustomer(Customer customer) => Customers.Add(customer);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
