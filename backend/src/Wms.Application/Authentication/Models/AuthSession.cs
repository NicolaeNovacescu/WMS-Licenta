namespace Wms.Application.Authentication.Models;

public sealed record AuthSession(
    Guid UserId,
    string UserName,
    IReadOnlyCollection<string> Roles,
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAtUtc,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAtUtc);
