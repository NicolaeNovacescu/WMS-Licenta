using Wms.Application.Authentication.Models;

namespace Wms.Application.Authentication.Abstractions;

public interface IAuthService
{
    Task<AuthSession?> LoginAsync(LoginCommand command, CancellationToken cancellationToken);
    Task<AuthSession?> RefreshAsync(RefreshCommand command, CancellationToken cancellationToken);
    Task LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken);
    Task<CurrentUserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);
}
