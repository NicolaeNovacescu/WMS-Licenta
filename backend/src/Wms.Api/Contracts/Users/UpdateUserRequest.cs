namespace Wms.Api.Contracts.Users;

public sealed record UpdateUserRequest(
    string UserName,
    string? Password,
    IReadOnlyList<string>? Roles);
