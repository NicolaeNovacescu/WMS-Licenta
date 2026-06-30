using Microsoft.EntityFrameworkCore;
using Wms.Application.Authentication.Abstractions;
using Wms.Domain.Authentication;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Authentication;

public sealed class RefreshTokenRepository(WmsDbContext dbContext) : IRefreshTokenRepository
{
    public Task<RefreshToken?> FindTrackedByTokenHashAsync(string tokenHash, CancellationToken cancellationToken) =>
        dbContext.RefreshTokens
            .Include(refreshToken => refreshToken.User)
            .ThenInclude(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(refreshToken => refreshToken.TokenHash == tokenHash, cancellationToken);

    public async Task<int> RevokeActiveTokensForUserAsync(
        Guid userId,
        DateTimeOffset revokedAtUtc,
        CancellationToken cancellationToken)
    {
        var activeTokens = await dbContext.RefreshTokens
            .Where(refreshToken =>
                refreshToken.UserId == userId &&
                refreshToken.RevokedAtUtc == null &&
                refreshToken.ExpiresAtUtc > revokedAtUtc)
            .ToListAsync(cancellationToken);

        foreach (var activeToken in activeTokens)
        {
            activeToken.Revoke(revokedAtUtc);
        }

        return activeTokens.Count;
    }

    public void Add(RefreshToken refreshToken) => dbContext.RefreshTokens.Add(refreshToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
