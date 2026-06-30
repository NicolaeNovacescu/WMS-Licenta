namespace Wms.Api.Contracts.Users;

public sealed record CreateUserRequest(
    string UserName,
    string Password,
    IReadOnlyList<string>? Roles);
