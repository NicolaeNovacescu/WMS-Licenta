namespace Wms.Application.Suppliers.Models;

public sealed record SupplierDetailDto(
    Guid Id,
    string Code,
    string Name,
    bool IsActive,
    int ReferencedInboundOrderCount,
    int ActiveReferencedInboundOrderCount);
