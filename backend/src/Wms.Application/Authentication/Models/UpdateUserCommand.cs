namespace Wms.Application.Authentication.Models;

public sealed record UpdateUserCommand(
    string UserName,
    string? Password,
    IReadOnlyCollection<string>? Roles);
