using Microsoft.EntityFrameworkCore;
using Wms.Application.Authentication.Abstractions;
using Wms.Domain.Authentication;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Authentication;

public sealed class UserAuthRepository(WmsDbContext dbContext) : IUserAuthRepository
{
    public Task<User?> FindByUserNameAsync(string userName, CancellationToken cancellationToken) =>
        dbContext.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(user => user.UserName == userName, cancellationToken);

    public Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(user => user.Id == userId, cancellationToken);
}
