using Wms.Domain.Inbound;

namespace Wms.Application.Suppliers.Abstractions;

public interface ISupplierManagementRepository
{
    Task<IReadOnlyList<Supplier>> ListSuppliersAsync(CancellationToken cancellationToken);
    Task<Supplier?> FindSupplierByIdAsync(Guid supplierId, CancellationToken cancellationToken);
    Task<(int TotalReferencedInboundOrders, int ActiveReferencedInboundOrders)> GetSupplierUsageAsync(
        Guid supplierId,
        CancellationToken cancellationToken);
    Task<bool> SupplierCodeExistsAsync(
        string code,
        Guid? excludedSupplierId,
        CancellationToken cancellationToken);
    void AddSupplier(Supplier supplier);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
