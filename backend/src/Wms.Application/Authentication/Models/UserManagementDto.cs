namespace Wms.Application.Authentication.Models;

public sealed record UserManagementDto(
    Guid Id,
    string UserName,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    IReadOnlyList<string> Roles);
