namespace Wms.Api.Contracts.Customers;

public sealed record CustomerResponse(
    Guid Id,
    string Code,
    string Name,
    bool IsActive);
