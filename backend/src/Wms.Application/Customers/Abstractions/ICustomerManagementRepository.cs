using Wms.Domain.Sales;

namespace Wms.Application.Customers.Abstractions;

public interface ICustomerManagementRepository
{
    Task<IReadOnlyList<Customer>> ListCustomersAsync(CancellationToken cancellationToken);
    Task<Customer?> FindCustomerByIdAsync(Guid customerId, CancellationToken cancellationToken);
    Task<(int TotalReferencedSalesOrders, int ActiveReferencedSalesOrders)> GetCustomerUsageAsync(
        Guid customerId,
        CancellationToken cancellationToken);
    Task<bool> CustomerCodeExistsAsync(
        string code,
        Guid? excludedCustomerId,
        CancellationToken cancellationToken);
    void AddCustomer(Customer customer);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
