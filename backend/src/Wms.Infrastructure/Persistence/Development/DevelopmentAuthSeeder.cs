using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Application.Authentication.Abstractions;
using Wms.Domain.Authentication;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentAuthSeeder
{
    private static readonly DemoUserDefinition[] DemoUsers =
    [
        new("admin.demo", "Admin123!", "Admin"),
        new("sales.demo", "Sales123!", "Sales"),
        new("warehouse.demo", "Warehouse123!", "Warehouse"),
    ];

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        IPasswordHasher passwordHasher,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var roleNames = DemoUsers
            .Select(user => user.RoleName)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var rolesByName = await dbContext.Roles
            .Where(role => roleNames.Contains(role.Name))
            .ToDictionaryAsync(role => role.Name, StringComparer.OrdinalIgnoreCase, cancellationToken);

        foreach (var roleName in roleNames)
        {
            if (rolesByName.ContainsKey(roleName))
            {
                continue;
            }

            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = roleName,
            };

            dbContext.Roles.Add(role);
            rolesByName[roleName] = role;
        }

        var demoUserNames = DemoUsers.Select(user => user.UserName).ToArray();

        var usersByName = await dbContext.Users
            .Include(user => user.UserRoles)
            .Where(user => demoUserNames.Contains(user.UserName))
            .ToDictionaryAsync(user => user.UserName, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var utcNow = DateTimeOffset.UtcNow;

        foreach (var definition in DemoUsers)
        {
            if (!rolesByName.TryGetValue(definition.RoleName, out var role))
            {
                throw new InvalidOperationException(
                    $"Role '{definition.RoleName}' was not available during development seeding.");
            }

            if (!usersByName.TryGetValue(definition.UserName, out var user))
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = definition.UserName,
                    IsActive = true,
                    CreatedAtUtc = utcNow,
                };

                user.PasswordHash = passwordHasher.HashPassword(user, definition.Password);
                user.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = role.Id,
                    User = user,
                    Role = role,
                });

                dbContext.Users.Add(user);
                usersByName[definition.UserName] = user;
                continue;
            }

            user.IsActive = true;

            if (user.CreatedAtUtc == default)
            {
                user.CreatedAtUtc = utcNow;
            }

            user.PasswordHash = passwordHasher.HashPassword(user, definition.Password);

            foreach (var existingUserRole in user.UserRoles
                         .Where(userRole => userRole.RoleId != role.Id)
                         .ToArray())
            {
                dbContext.UserRoles.Remove(existingUserRole);
            }

            if (user.UserRoles.All(userRole => userRole.RoleId != role.Id))
            {
                user.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = role.Id,
                    User = user,
                    Role = role,
                });
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development auth seed ensured demo roles and users are ready: {UserNames}.",
            string.Join(", ", DemoUsers.Select(user => user.UserName)));
    }

    private sealed record DemoUserDefinition(
        string UserName,
        string Password,
        string RoleName);
}
