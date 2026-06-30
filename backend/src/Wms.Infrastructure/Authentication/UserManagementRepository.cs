using Microsoft.EntityFrameworkCore;
using Wms.Application.Authentication.Abstractions;
using Wms.Domain.Authentication;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Authentication;

public sealed class UserManagementRepository(WmsDbContext dbContext) : IUserManagementRepository
{
    public async Task<IReadOnlyList<User>> ListUsersAsync(CancellationToken cancellationToken) =>
        await dbContext.Users
            .AsNoTracking()
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .OrderBy(user => user.UserName)
            .ToListAsync(cancellationToken);

    public Task<User?> FindUserByIdAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(user => user.Id == userId, cancellationToken);

    public Task<User?> FindUserByUserNameInsensitiveAsync(string userName, CancellationToken cancellationToken)
    {
        var normalizedUserName = userName.ToUpperInvariant();

        return dbContext.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .FirstOrDefaultAsync(user => user.UserName.ToUpper() == normalizedUserName, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<string, Role>> FindRolesByNamesAsync(
        IReadOnlyCollection<string> roleNames,
        CancellationToken cancellationToken)
    {
        var roles = await dbContext.Roles
            .Where(role => roleNames.Contains(role.Name))
            .ToListAsync(cancellationToken);

        return roles.ToDictionary(role => role.Name, StringComparer.OrdinalIgnoreCase);
    }

    public void AddUser(User user) => dbContext.Users.Add(user);

    public void RemoveUserRole(UserRole userRole)
    {
        userRole.User.UserRoles.Remove(userRole);
        dbContext.UserRoles.Remove(userRole);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
