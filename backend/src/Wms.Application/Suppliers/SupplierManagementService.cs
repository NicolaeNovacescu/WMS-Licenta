using Wms.Application.Suppliers.Abstractions;
using Wms.Application.Suppliers.Models;
using Wms.Domain.Inbound;

namespace Wms.Application.Suppliers;

public sealed class SupplierManagementService(ISupplierManagementRepository repository)
{
    public async Task<IReadOnlyList<SupplierDto>> ListSuppliersAsync(CancellationToken cancellationToken)
    {
        var suppliers = await repository.ListSuppliersAsync(cancellationToken);
        return suppliers
            .Select(MapSupplier)
            .ToArray();
    }

    public async Task<SupplierDetailDto?> GetSupplierByIdAsync(Guid supplierId, CancellationToken cancellationToken)
    {
        var supplier = await repository.FindSupplierByIdAsync(supplierId, cancellationToken);
        if (supplier is null)
        {
            return null;
        }

        var usage = await repository.GetSupplierUsageAsync(supplierId, cancellationToken);
        return MapSupplierDetail(supplier, usage);
    }

    public async Task<SupplierDto> CreateSupplierAsync(
        CreateSupplierCommand command,
        CancellationToken cancellationToken)
    {
        var code = NormalizeRequired(command.Code, nameof(command.Code));
        var name = NormalizeRequired(command.Name, nameof(command.Name));

        await EnsureSupplierCodeIsUniqueAsync(code, null, cancellationToken);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            IsActive = true,
        };

        repository.AddSupplier(supplier);
        await repository.SaveChangesAsync(cancellationToken);

        return MapSupplier(supplier);
    }

    public async Task<SupplierDto> UpdateSupplierAsync(
        Guid supplierId,
        UpdateSupplierCommand command,
        CancellationToken cancellationToken)
    {
        var supplier = await repository.FindSupplierByIdAsync(supplierId, cancellationToken)
            ?? throw new KeyNotFoundException($"Supplier '{supplierId}' was not found.");

        var code = NormalizeRequired(command.Code, nameof(command.Code));
        var name = NormalizeRequired(command.Name, nameof(command.Name));

        await EnsureSupplierCodeIsUniqueAsync(code, supplier.Id, cancellationToken);

        supplier.Code = code;
        supplier.Name = name;

        await repository.SaveChangesAsync(cancellationToken);

        return MapSupplier(supplier);
    }

    public async Task<SupplierDto> ActivateSupplierAsync(Guid supplierId, CancellationToken cancellationToken)
    {
        var supplier = await repository.FindSupplierByIdAsync(supplierId, cancellationToken)
            ?? throw new KeyNotFoundException($"Supplier '{supplierId}' was not found.");

        if (supplier.IsActive)
        {
            throw new InvalidOperationException($"Supplier '{supplier.Code}' is already active.");
        }

        supplier.IsActive = true;
        await repository.SaveChangesAsync(cancellationToken);

        return MapSupplier(supplier);
    }

    public async Task<SupplierDto> DeactivateSupplierAsync(Guid supplierId, CancellationToken cancellationToken)
    {
        var supplier = await repository.FindSupplierByIdAsync(supplierId, cancellationToken)
            ?? throw new KeyNotFoundException($"Supplier '{supplierId}' was not found.");

        if (!supplier.IsActive)
        {
            throw new InvalidOperationException($"Supplier '{supplier.Code}' is already inactive.");
        }

        supplier.IsActive = false;
        await repository.SaveChangesAsync(cancellationToken);

        return MapSupplier(supplier);
    }

    private async Task EnsureSupplierCodeIsUniqueAsync(
        string code,
        Guid? excludedSupplierId,
        CancellationToken cancellationToken)
    {
        if (await repository.SupplierCodeExistsAsync(code, excludedSupplierId, cancellationToken))
        {
            throw new InvalidOperationException($"Supplier code '{code}' is already in use.");
        }
    }

    private static SupplierDto MapSupplier(Supplier supplier) =>
        new(
            supplier.Id,
            supplier.Code,
            supplier.Name,
            supplier.IsActive);

    private static SupplierDetailDto MapSupplierDetail(
        Supplier supplier,
        (int TotalReferencedInboundOrders, int ActiveReferencedInboundOrders) usage) =>
        new(
            supplier.Id,
            supplier.Code,
            supplier.Name,
            supplier.IsActive,
            usage.TotalReferencedInboundOrders,
            usage.ActiveReferencedInboundOrders);

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
