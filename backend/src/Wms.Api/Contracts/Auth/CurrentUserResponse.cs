namespace Wms.Api.Contracts.Auth;

public sealed record CurrentUserResponse(
    Guid Id,
    string UserName,
    IReadOnlyCollection<string> Roles);
