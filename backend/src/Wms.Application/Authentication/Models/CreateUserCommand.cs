namespace Wms.Application.Authentication.Models;

public sealed record CreateUserCommand(
    string UserName,
    string Password,
    IReadOnlyCollection<string>? Roles);
