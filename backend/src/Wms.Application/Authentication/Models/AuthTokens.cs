namespace Wms.Application.Authentication.Models;

public sealed record AuthTokens(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAtUtc,
    string RefreshToken,
    string RefreshTokenHash,
    DateTimeOffset RefreshTokenExpiresAtUtc,
    DateTimeOffset IssuedAtUtc);
