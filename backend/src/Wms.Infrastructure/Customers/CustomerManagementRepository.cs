using Microsoft.EntityFrameworkCore;
using Wms.Application.Customers.Abstractions;
using Wms.Domain.Sales;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Customers;

public sealed class CustomerManagementRepository(WmsDbContext dbContext) : ICustomerManagementRepository
{
    public async Task<IReadOnlyList<Customer>> ListCustomersAsync(CancellationToken cancellationToken) =>
        await dbContext.Customers
            .OrderBy(customer => customer.Code)
            .ThenBy(customer => customer.Name)
            .ToArrayAsync(cancellationToken);

    public Task<Customer?> FindCustomerByIdAsync(Guid customerId, CancellationToken cancellationToken) =>
        dbContext.Customers.SingleOrDefaultAsync(customer => customer.Id == customerId, cancellationToken);

    public async Task<(int TotalReferencedSalesOrders, int ActiveReferencedSalesOrders)> GetCustomerUsageAsync(
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var usage = await dbContext.SalesOrders
            .AsNoTracking()
            .Where(order => order.CustomerId == customerId)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalReferencedSalesOrders = group.Count(),
                ActiveReferencedSalesOrders = group.Count(order =>
                    order.Status != SalesOrderStatus.Cancelled),
            })
            .SingleOrDefaultAsync(cancellationToken);

        return usage is null
            ? (0, 0)
            : (usage.TotalReferencedSalesOrders, usage.ActiveReferencedSalesOrders);
    }

    public Task<bool> CustomerCodeExistsAsync(
        string code,
        Guid? excludedCustomerId,
        CancellationToken cancellationToken) =>
        dbContext.Customers.AnyAsync(customer =>
            customer.Code.ToLower() == code.ToLower() &&
            (!excludedCustomerId.HasValue || customer.Id != excludedCustomerId.Value),
            cancellationToken);

    public void AddCustomer(Customer customer) => dbContext.Customers.Add(customer);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
