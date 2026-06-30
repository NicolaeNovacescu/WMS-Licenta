using Wms.Domain.Authentication;

namespace Wms.Application.Authentication.Abstractions;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> FindTrackedByTokenHashAsync(string tokenHash, CancellationToken cancellationToken);
    Task<int> RevokeActiveTokensForUserAsync(Guid userId, DateTimeOffset revokedAtUtc, CancellationToken cancellationToken);
    void Add(RefreshToken refreshToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
