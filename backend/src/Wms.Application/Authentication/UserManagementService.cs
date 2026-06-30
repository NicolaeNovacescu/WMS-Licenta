using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Authentication.Abstractions;
using Wms.Application.Authentication.Models;
using Wms.Domain.Authentication;

namespace Wms.Application.Authentication;

public sealed class UserManagementService(
    IUserManagementRepository repository,
    IRefreshTokenRepository refreshTokenRepository,
    IPasswordHasher passwordHasher,
    IAuditLogWriter? auditLogWriter = null)
{
    private static readonly string[] SupportedRoleNames = ["Admin", "Warehouse", "Sales"];
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<UserManagementDto>> ListUsersAsync(CancellationToken cancellationToken)
    {
        var users = await repository.ListUsersAsync(cancellationToken);
        return users
            .Select(MapUser)
            .ToArray();
    }

    public async Task<UserManagementDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await repository.FindUserByIdAsync(userId, cancellationToken);
        return user is null ? null : MapUser(user);
    }

    public async Task<UserManagementDto> CreateUserAsync(
        CreateUserCommand command,
        CancellationToken cancellationToken)
    {
        var userName = NormalizeUserName(command.UserName);
        var password = RequirePassword(command.Password);
        var roleNames = NormalizeRoles(command.Roles);

        var existingUser = await repository.FindUserByUserNameInsensitiveAsync(userName, cancellationToken);
        if (existingUser is not null)
        {
            throw new InvalidOperationException($"User name '{userName}' is already in use.");
        }

        var rolesByName = await LoadRolesByNameAsync(roleNames, cancellationToken);
        var utcNow = DateTimeOffset.UtcNow;

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = userName,
            IsActive = true,
            CreatedAtUtc = utcNow,
        };

        user.PasswordHash = passwordHasher.HashPassword(user, password);

        foreach (var roleName in roleNames)
        {
            var role = rolesByName[roleName];
            user.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                User = user,
                Role = role,
            });
        }

        repository.AddUser(user);
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "UserCreated",
            "User",
            user.Id.ToString(),
            $"Created user '{user.UserName}'.",
            new
            {
                userName = user.UserName,
                isActive = user.IsActive,
                roles = roleNames,
            }));

        await repository.SaveChangesAsync(cancellationToken);

        return MapUser(user);
    }

    public async Task<UserManagementDto> UpdateUserAsync(
        Guid userId,
        UpdateUserCommand command,
        CancellationToken cancellationToken)
    {
        var user = await repository.FindUserByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{userId}' was not found.");

        var userName = NormalizeUserName(command.UserName);
        var roleNames = NormalizeRoles(command.Roles);
        var existingUser = await repository.FindUserByUserNameInsensitiveAsync(userName, cancellationToken);

        if (existingUser is not null && existingUser.Id != user.Id)
        {
            throw new InvalidOperationException($"User name '{userName}' is already in use.");
        }

        var rolesByName = await LoadRolesByNameAsync(roleNames, cancellationToken);
        var passwordChanged = command.Password is not null;

        if (passwordChanged)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, RequirePassword(command.Password!));
        }

        user.UserName = userName;
        ReplaceRoles(user, roleNames, rolesByName);

        _auditLogWriter.Write(new AuditLogWriteEntry(
            "UserUpdated",
            "User",
            user.Id.ToString(),
            $"Updated user '{user.UserName}'.",
            new
            {
                userName = user.UserName,
                isActive = user.IsActive,
                roles = roleNames,
                passwordChanged,
            }));

        await repository.SaveChangesAsync(cancellationToken);

        return MapUser(user);
    }

    public async Task<UserManagementDto> ActivateUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await repository.FindUserByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{userId}' was not found.");

        if (user.IsActive)
        {
            throw new InvalidOperationException($"User '{user.UserName}' is already active.");
        }

        user.IsActive = true;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "UserActivated",
            "User",
            user.Id.ToString(),
            $"Activated user '{user.UserName}'.",
            new
            {
                userName = user.UserName,
                statusFrom = "Inactive",
                statusTo = "Active",
            }));

        await repository.SaveChangesAsync(cancellationToken);

        return MapUser(user);
    }

    public async Task<UserManagementDto> DeactivateUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await repository.FindUserByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{userId}' was not found.");

        if (!user.IsActive)
        {
            throw new InvalidOperationException($"User '{user.UserName}' is already inactive.");
        }

        var utcNow = DateTimeOffset.UtcNow;
        user.IsActive = false;
        var revokedRefreshTokenCount = await refreshTokenRepository.RevokeActiveTokensForUserAsync(
            user.Id,
            utcNow,
            cancellationToken);

        _auditLogWriter.Write(new AuditLogWriteEntry(
            "UserDeactivated",
            "User",
            user.Id.ToString(),
            $"Deactivated user '{user.UserName}'.",
            new
            {
                userName = user.UserName,
                statusFrom = "Active",
                statusTo = "Inactive",
                revokedRefreshTokenCount,
            }));

        await repository.SaveChangesAsync(cancellationToken);

        return MapUser(user);
    }

    private async Task<IReadOnlyDictionary<string, Role>> LoadRolesByNameAsync(
        string[] roleNames,
        CancellationToken cancellationToken)
    {
        var rolesByName = await repository.FindRolesByNamesAsync(roleNames, cancellationToken);
        var missingRoleNames = roleNames
            .Where(roleName => !rolesByName.ContainsKey(roleName))
            .ToArray();

        if (missingRoleNames.Length > 0)
        {
            throw new InvalidOperationException(
                $"The role configuration is incomplete. Missing role records: {string.Join(", ", missingRoleNames)}.");
        }

        return rolesByName;
    }

    private void ReplaceRoles(
        User user,
        IReadOnlyCollection<string> roleNames,
        IReadOnlyDictionary<string, Role> rolesByName)
    {
        foreach (var existingUserRole in user.UserRoles
                     .Where(userRole => !roleNames.Contains(userRole.Role.Name, StringComparer.OrdinalIgnoreCase))
                     .ToArray())
        {
            repository.RemoveUserRole(existingUserRole);
        }

        foreach (var roleName in roleNames)
        {
            if (user.UserRoles.Any(userRole => string.Equals(userRole.Role.Name, roleName, StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            var role = rolesByName[roleName];
            user.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                User = user,
                Role = role,
            });
        }
    }

    private static UserManagementDto MapUser(User user) =>
        new(
            user.Id,
            user.UserName,
            user.IsActive,
            user.CreatedAtUtc,
            user.UserRoles
                .Select(userRole => userRole.Role.Name)
                .Where(roleName => !string.IsNullOrWhiteSpace(roleName))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Order(StringComparer.OrdinalIgnoreCase)
                .ToArray());

    private static string NormalizeUserName(string? userName)
    {
        var normalized = userName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("User name is required.", "userName");
        }

        return normalized;
    }

    private static string RequirePassword(string? password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password is required.", "password");
        }

        return password;
    }

    private static string[] NormalizeRoles(IReadOnlyCollection<string>? roles)
    {
        if (roles is null || roles.Count == 0)
        {
            throw new ArgumentException("At least one role is required.", "roles");
        }

        var normalizedRoles = roles
            .Select(role => role?.Trim() ?? string.Empty)
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Order(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (normalizedRoles.Length == 0)
        {
            throw new ArgumentException("At least one role is required.", "roles");
        }

        var unsupportedRoleNames = normalizedRoles
            .Where(roleName => !SupportedRoleNames.Contains(roleName, StringComparer.OrdinalIgnoreCase))
            .ToArray();

        if (unsupportedRoleNames.Length > 0)
        {
            throw new ArgumentException(
                $"Supported roles are: {string.Join(", ", SupportedRoleNames)}.",
                "roles");
        }

        return normalizedRoles
            .Select(roleName => SupportedRoleNames.Single(
                supportedRoleName => string.Equals(supportedRoleName, roleName, StringComparison.OrdinalIgnoreCase)))
            .Order(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }
}
