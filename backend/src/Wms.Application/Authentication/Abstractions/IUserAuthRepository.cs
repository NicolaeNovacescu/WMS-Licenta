using Wms.Domain.Authentication;

namespace Wms.Application.Authentication.Abstractions;

public interface IUserAuthRepository
{
    Task<User?> FindByUserNameAsync(string userName, CancellationToken cancellationToken);
    Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken);
}
