namespace Wms.Application.Customers.Models;

public sealed record CustomerDto(
    Guid Id,
    string Code,
    string Name,
    bool IsActive);
