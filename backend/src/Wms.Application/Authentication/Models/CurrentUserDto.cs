namespace Wms.Application.Authentication.Models;

public sealed record CurrentUserDto(
    Guid UserId,
    string UserName,
    IReadOnlyCollection<string> Roles);
