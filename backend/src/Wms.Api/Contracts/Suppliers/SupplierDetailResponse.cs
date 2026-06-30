namespace Wms.Api.Contracts.Suppliers;

public sealed record SupplierDetailResponse(
    Guid Id,
    string Code,
    string Name,
    bool IsActive,
    int ReferencedInboundOrderCount,
    int ActiveReferencedInboundOrderCount);
