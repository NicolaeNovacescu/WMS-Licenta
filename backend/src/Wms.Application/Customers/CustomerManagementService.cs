using Wms.Application.Customers.Abstractions;
using Wms.Application.Customers.Models;
using Wms.Domain.Sales;

namespace Wms.Application.Customers;

public sealed class CustomerManagementService(ICustomerManagementRepository repository)
{
    public async Task<IReadOnlyList<CustomerDto>> ListCustomersAsync(CancellationToken cancellationToken)
    {
        var customers = await repository.ListCustomersAsync(cancellationToken);
        return customers
            .Select(MapCustomer)
            .ToArray();
    }

    public async Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid customerId, CancellationToken cancellationToken)
    {
        var customer = await repository.FindCustomerByIdAsync(customerId, cancellationToken);
        if (customer is null)
        {
            return null;
        }

        var usage = await repository.GetCustomerUsageAsync(customerId, cancellationToken);
        return MapCustomerDetail(customer, usage);
    }

    public async Task<CustomerDto> CreateCustomerAsync(
        CreateCustomerCommand command,
        CancellationToken cancellationToken)
    {
        var code = NormalizeRequired(command.Code, nameof(command.Code));
        var name = NormalizeRequired(command.Name, nameof(command.Name));

        await EnsureCustomerCodeIsUniqueAsync(code, null, cancellationToken);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            IsActive = true,
        };

        repository.AddCustomer(customer);
        await repository.SaveChangesAsync(cancellationToken);

        return MapCustomer(customer);
    }

    public async Task<CustomerDto> UpdateCustomerAsync(
        Guid customerId,
        UpdateCustomerCommand command,
        CancellationToken cancellationToken)
    {
        var customer = await repository.FindCustomerByIdAsync(customerId, cancellationToken)
            ?? throw new KeyNotFoundException($"Customer '{customerId}' was not found.");

        var code = NormalizeRequired(command.Code, nameof(command.Code));
        var name = NormalizeRequired(command.Name, nameof(command.Name));

        await EnsureCustomerCodeIsUniqueAsync(code, customer.Id, cancellationToken);

        customer.Code = code;
        customer.Name = name;

        await repository.SaveChangesAsync(cancellationToken);

        return MapCustomer(customer);
    }

    public async Task<CustomerDto> ActivateCustomerAsync(Guid customerId, CancellationToken cancellationToken)
    {
        var customer = await repository.FindCustomerByIdAsync(customerId, cancellationToken)
            ?? throw new KeyNotFoundException($"Customer '{customerId}' was not found.");

        if (customer.IsActive)
        {
            throw new InvalidOperationException($"Customer '{customer.Code}' is already active.");
        }

        customer.IsActive = true;
        await repository.SaveChangesAsync(cancellationToken);

        return MapCustomer(customer);
    }

    public async Task<CustomerDto> DeactivateCustomerAsync(Guid customerId, CancellationToken cancellationToken)
    {
        var customer = await repository.FindCustomerByIdAsync(customerId, cancellationToken)
            ?? throw new KeyNotFoundException($"Customer '{customerId}' was not found.");

        if (!customer.IsActive)
        {
            throw new InvalidOperationException($"Customer '{customer.Code}' is already inactive.");
        }

        customer.IsActive = false;
        await repository.SaveChangesAsync(cancellationToken);

        return MapCustomer(customer);
    }

    private async Task EnsureCustomerCodeIsUniqueAsync(
        string code,
        Guid? excludedCustomerId,
        CancellationToken cancellationToken)
    {
        if (await repository.CustomerCodeExistsAsync(code, excludedCustomerId, cancellationToken))
        {
            throw new InvalidOperationException($"Customer code '{code}' is already in use.");
        }
    }

    private static CustomerDto MapCustomer(Customer customer) =>
        new(
            customer.Id,
            customer.Code,
            customer.Name,
            customer.IsActive);

    private static CustomerDetailDto MapCustomerDetail(
        Customer customer,
        (int TotalReferencedSalesOrders, int ActiveReferencedSalesOrders) usage) =>
        new(
            customer.Id,
            customer.Code,
            customer.Name,
            customer.IsActive,
            usage.TotalReferencedSalesOrders,
            usage.ActiveReferencedSalesOrders);

    private static string NormalizeRequired(string? value, string parameterName)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("A value is required.", parameterName);
        }

        return normalized;
    }
}
