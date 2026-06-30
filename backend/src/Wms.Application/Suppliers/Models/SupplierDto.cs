namespace Wms.Application.Suppliers.Models;

public sealed record SupplierDto(
    Guid Id,
    string Code,
    string Name,
    bool IsActive);
