using Wms.Application.Authentication.Abstractions;
using Wms.Application.Authentication.Models;
using Wms.Domain.Authentication;

namespace Wms.Application.Authentication;

public sealed class AuthService(
    IUserAuthRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IPasswordHasher passwordHasher,
    ITokenFactory tokenFactory) : IAuthService
{
    public async Task<AuthSession?> LoginAsync(LoginCommand command, CancellationToken cancellationToken)
    {
        var userName = command.UserName.Trim();
        if (string.IsNullOrWhiteSpace(userName) || string.IsNullOrWhiteSpace(command.Password))
        {
            return null;
        }

        var user = await userRepository.FindByUserNameAsync(userName, cancellationToken);
        if (user is null || !user.IsActive || !passwordHasher.VerifyPassword(user, command.Password))
        {
            return null;
        }

        var roles = GetRoles(user);
        var tokens = tokenFactory.CreateTokens(user, roles);

        refreshTokenRepository.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokens.RefreshTokenHash,
            CreatedAtUtc = tokens.IssuedAtUtc,
            ExpiresAtUtc = tokens.RefreshTokenExpiresAtUtc,
        });

        await refreshTokenRepository.SaveChangesAsync(cancellationToken);

        return new AuthSession(
            user.Id,
            user.UserName,
            roles,
            tokens.AccessToken,
            tokens.AccessTokenExpiresAtUtc,
            tokens.RefreshToken,
            tokens.RefreshTokenExpiresAtUtc);
    }

    public async Task<AuthSession?> RefreshAsync(RefreshCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.RefreshToken))
        {
            return null;
        }

        var tokenHash = tokenFactory.ComputeRefreshTokenHash(command.RefreshToken);
        var existingToken = await refreshTokenRepository.FindTrackedByTokenHashAsync(tokenHash, cancellationToken);
        var utcNow = DateTimeOffset.UtcNow;

        if (existingToken is null || !existingToken.IsActiveAt(utcNow) || !existingToken.User.IsActive)
        {
            return null;
        }

        existingToken.Revoke(utcNow);

        var roles = GetRoles(existingToken.User);
        var tokens = tokenFactory.CreateTokens(existingToken.User, roles);

        refreshTokenRepository.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = existingToken.UserId,
            TokenHash = tokens.RefreshTokenHash,
            CreatedAtUtc = tokens.IssuedAtUtc,
            ExpiresAtUtc = tokens.RefreshTokenExpiresAtUtc,
        });

        await refreshTokenRepository.SaveChangesAsync(cancellationToken);

        return new AuthSession(
            existingToken.User.Id,
            existingToken.User.UserName,
            roles,
            tokens.AccessToken,
            tokens.AccessTokenExpiresAtUtc,
            tokens.RefreshToken,
            tokens.RefreshTokenExpiresAtUtc);
    }

    public async Task LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenHash = tokenFactory.ComputeRefreshTokenHash(refreshToken);
        var existingToken = await refreshTokenRepository.FindTrackedByTokenHashAsync(tokenHash, cancellationToken);
        var utcNow = DateTimeOffset.UtcNow;

        if (existingToken is null || existingToken.UserId != userId || !existingToken.IsActiveAt(utcNow))
        {
            return;
        }

        existingToken.Revoke(utcNow);
        await refreshTokenRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<CurrentUserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await userRepository.FindByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            return null;
        }

        return new CurrentUserDto(user.Id, user.UserName, GetRoles(user));
    }

    private static string[] GetRoles(User user) =>
        user.UserRoles
            .Select(userRole => userRole.Role.Name)
            .Where(roleName => !string.IsNullOrWhiteSpace(roleName))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Order(StringComparer.OrdinalIgnoreCase)
            .ToArray();
}
