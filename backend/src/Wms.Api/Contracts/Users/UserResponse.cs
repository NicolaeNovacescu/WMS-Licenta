namespace Wms.Api.Contracts.Users;

public sealed record UserResponse(
    Guid Id,
    string UserName,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    IReadOnlyList<string> Roles);
