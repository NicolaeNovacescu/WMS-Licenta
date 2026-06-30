using Wms.Domain.Authentication;

namespace Wms.Application.Authentication.Abstractions;

public interface IUserManagementRepository
{
    Task<IReadOnlyList<User>> ListUsersAsync(CancellationToken cancellationToken);
    Task<User?> FindUserByIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<User?> FindUserByUserNameInsensitiveAsync(string userName, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<string, Role>> FindRolesByNamesAsync(
        IReadOnlyCollection<string> roleNames,
        CancellationToken cancellationToken);
    void AddUser(User user);
    void RemoveUserRole(UserRole userRole);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
