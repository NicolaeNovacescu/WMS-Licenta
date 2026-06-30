namespace Wms.Api.Contracts.Customers;

public sealed record CustomerDetailResponse(
    Guid Id,
    string Code,
    string Name,
    bool IsActive,
    int ReferencedSalesOrderCount,
    int ActiveReferencedSalesOrderCount);
