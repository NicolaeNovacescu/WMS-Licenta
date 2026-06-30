using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Wms.Application.Authentication.Abstractions;
using Wms.Application.Authentication.Models;
using Wms.Domain.Authentication;

namespace Wms.Infrastructure.Authentication;

public sealed class JwtTokenFactory(IOptions<JwtOptions> options) : ITokenFactory
{
    private readonly JwtOptions _options = options.Value;
    private readonly JwtSecurityTokenHandler _tokenHandler = new();

    public AuthTokens CreateTokens(User user, IReadOnlyCollection<string> roles)
    {
        var issuedAtUtc = DateTimeOffset.UtcNow;
        var accessTokenExpiresAtUtc = issuedAtUtc.AddMinutes(_options.AccessTokenMinutes);
        var refreshTokenExpiresAtUtc = issuedAtUtc.AddDays(_options.RefreshTokenDays);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Expires = accessTokenExpiresAtUtc.UtcDateTime,
            NotBefore = issuedAtUtc.UtcDateTime,
            SigningCredentials = credentials,
        };

        var accessToken = _tokenHandler.CreateEncodedJwt(tokenDescriptor);
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        return new AuthTokens(
            accessToken,
            accessTokenExpiresAtUtc,
            refreshToken,
            ComputeRefreshTokenHash(refreshToken),
            refreshTokenExpiresAtUtc,
            issuedAtUtc);
    }

    public string ComputeRefreshTokenHash(string refreshToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(bytes);
    }
}
