namespace Wms.Application.Customers.Models;

public sealed record CustomerDetailDto(
    Guid Id,
    string Code,
    string Name,
    bool IsActive,
    int ReferencedSalesOrderCount,
    int ActiveReferencedSalesOrderCount);
