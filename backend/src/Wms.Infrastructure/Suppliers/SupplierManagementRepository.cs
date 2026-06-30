using Microsoft.EntityFrameworkCore;
using Wms.Application.Suppliers.Abstractions;
using Wms.Domain.Inbound;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Suppliers;

public sealed class SupplierManagementRepository(WmsDbContext dbContext) : ISupplierManagementRepository
{
    public async Task<IReadOnlyList<Supplier>> ListSuppliersAsync(CancellationToken cancellationToken) =>
        await dbContext.Suppliers
            .AsNoTracking()
            .OrderBy(supplier => supplier.Code)
            .ThenBy(supplier => supplier.Name)
            .ToListAsync(cancellationToken);

    public Task<Supplier?> FindSupplierByIdAsync(Guid supplierId, CancellationToken cancellationToken) =>
        dbContext.Suppliers
            .SingleOrDefaultAsync(supplier => supplier.Id == supplierId, cancellationToken);

    public async Task<(int TotalReferencedInboundOrders, int ActiveReferencedInboundOrders)> GetSupplierUsageAsync(
        Guid supplierId,
        CancellationToken cancellationToken)
    {
        var usage = await dbContext.InboundOrders
            .AsNoTracking()
            .Where(order => order.SupplierId == supplierId)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalReferencedInboundOrders = group.Count(),
                ActiveReferencedInboundOrders = group.Count(order =>
                    order.Status != InboundOrderStatus.FullyReceived &&
                    order.Status != InboundOrderStatus.Cancelled),
            })
            .SingleOrDefaultAsync(cancellationToken);

        return usage is null
            ? (0, 0)
            : (usage.TotalReferencedInboundOrders, usage.ActiveReferencedInboundOrders);
    }

    public Task<bool> SupplierCodeExistsAsync(
        string code,
        Guid? excludedSupplierId,
        CancellationToken cancellationToken)
    {
        var normalizedCode = code.ToUpperInvariant();

        return dbContext.Suppliers.AnyAsync(
            supplier =>
                supplier.Code.ToUpper() == normalizedCode &&
                (!excludedSupplierId.HasValue || supplier.Id != excludedSupplierId.Value),
            cancellationToken);
    }

    public void AddSupplier(Supplier supplier) => dbContext.Suppliers.Add(supplier);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
