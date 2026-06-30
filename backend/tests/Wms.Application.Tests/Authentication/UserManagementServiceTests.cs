using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Authentication;
using Wms.Application.Authentication.Abstractions;
using Wms.Application.Authentication.Models;
using Wms.Domain.Authentication;
using Xunit;

namespace Wms.Application.Tests.Authentication;

public sealed class UserManagementServiceTests
{
    [Fact]
    public async Task CreateUserAsync_CreatesActiveUser_WithApprovedRolesAndAuditEntry()
    {
        var repository = new InMemoryUserManagementRepository();
        var refreshTokenRepository = new InMemoryRefreshTokenRepository();
        var auditLogWriter = new CollectingAuditLogWriter();
        var service = CreateService(repository, refreshTokenRepository, auditLogWriter);

        var user = await service.CreateUserAsync(
            new CreateUserCommand("new.admin", "Admin123!", ["admin"]),
            CancellationToken.None);

        Assert.Equal("new.admin", user.UserName);
        Assert.True(user.IsActive);
        Assert.Equal(["Admin"], user.Roles);
        Assert.Single(repository.Users);
        Assert.Equal("hashed:Admin123!", repository.Users[0].PasswordHash);
        Assert.Single(auditLogWriter.Entries);
        Assert.Equal("UserCreated", auditLogWriter.Entries[0].ActionType);
    }

    [Fact]
    public async Task CreateUserAsync_RejectsUnsupportedRoles()
    {
        var service = CreateService(
            new InMemoryUserManagementRepository(),
            new InMemoryRefreshTokenRepository(),
            new CollectingAuditLogWriter());

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            service.CreateUserAsync(
                new CreateUserCommand("operator", "Password123!", ["Supervisor"]),
                CancellationToken.None));

        Assert.Equal("roles", exception.ParamName);
    }

    [Fact]
    public async Task UpdateUserAsync_UpdatesUserNameRolesAndPassword_WhenPasswordProvided()
    {
        var repository = new InMemoryUserManagementRepository();
        var existingUser = repository.SeedUser("warehouse.user", true, "hashed:old", ["Warehouse"]);
        var service = CreateService(
            repository,
            new InMemoryRefreshTokenRepository(),
            new CollectingAuditLogWriter());

        var updatedUser = await service.UpdateUserAsync(
            existingUser.Id,
            new UpdateUserCommand("warehouse.lead", "NewPassword123!", ["Admin", "Warehouse"]),
            CancellationToken.None);

        Assert.Equal("warehouse.lead", updatedUser.UserName);
        Assert.Equal(["Admin", "Warehouse"], updatedUser.Roles);
        Assert.Equal("hashed:NewPassword123!", existingUser.PasswordHash);
        Assert.Equal(2, existingUser.UserRoles.Count);
    }

    [Fact]
    public async Task DeactivateUserAsync_MarksUserInactive_AndRevokesActiveRefreshTokens()
    {
        var repository = new InMemoryUserManagementRepository();
        var refreshTokenRepository = new InMemoryRefreshTokenRepository();
        var user = repository.SeedUser("sales.user", true, "hashed", ["Sales"]);
        refreshTokenRepository.StoredTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = "active",
            CreatedAtUtc = DateTimeOffset.UtcNow.AddHours(-1),
            ExpiresAtUtc = DateTimeOffset.UtcNow.AddHours(1),
        });

        refreshTokenRepository.StoredTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = "expired",
            CreatedAtUtc = DateTimeOffset.UtcNow.AddHours(-2),
            ExpiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(-1),
        });

        var auditLogWriter = new CollectingAuditLogWriter();
        var service = CreateService(repository, refreshTokenRepository, auditLogWriter);

        var updatedUser = await service.DeactivateUserAsync(user.Id, CancellationToken.None);

        Assert.False(updatedUser.IsActive);
        Assert.False(user.IsActive);
        Assert.NotNull(refreshTokenRepository.StoredTokens[0].RevokedAtUtc);
        Assert.Null(refreshTokenRepository.StoredTokens[1].RevokedAtUtc);
        Assert.Equal("UserDeactivated", auditLogWriter.Entries.Single().ActionType);
    }

    [Fact]
    public async Task ActivateUserAsync_MarksInactiveUserActive()
    {
        var repository = new InMemoryUserManagementRepository();
        var user = repository.SeedUser("admin.user", false, "hashed", ["Admin"]);
        var service = CreateService(
            repository,
            new InMemoryRefreshTokenRepository(),
            new CollectingAuditLogWriter());

        var updatedUser = await service.ActivateUserAsync(user.Id, CancellationToken.None);

        Assert.True(updatedUser.IsActive);
        Assert.True(user.IsActive);
    }

    private static UserManagementService CreateService(
        InMemoryUserManagementRepository repository,
        InMemoryRefreshTokenRepository refreshTokenRepository,
        CollectingAuditLogWriter auditLogWriter) =>
        new(
            repository,
            refreshTokenRepository,
            new FakePasswordHasher(),
            auditLogWriter);

    private sealed class InMemoryUserManagementRepository : IUserManagementRepository
    {
        public List<User> Users { get; } = [];

        private readonly List<Role> _roles =
        [
            new() { Id = Guid.NewGuid(), Name = "Admin" },
            new() { Id = Guid.NewGuid(), Name = "Warehouse" },
            new() { Id = Guid.NewGuid(), Name = "Sales" },
        ];

        public Task<IReadOnlyList<User>> ListUsersAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<User>>(Users.OrderBy(user => user.UserName).ToArray());

        public Task<User?> FindUserByIdAsync(Guid userId, CancellationToken cancellationToken) =>
            Task.FromResult(Users.SingleOrDefault(user => user.Id == userId));

        public Task<User?> FindUserByUserNameInsensitiveAsync(string userName, CancellationToken cancellationToken) =>
            Task.FromResult(Users.SingleOrDefault(user =>
                string.Equals(user.UserName, userName, StringComparison.OrdinalIgnoreCase)));

        public Task<IReadOnlyDictionary<string, Role>> FindRolesByNamesAsync(
            IReadOnlyCollection<string> roleNames,
            CancellationToken cancellationToken)
        {
            IReadOnlyDictionary<string, Role> roles = _roles
                .Where(role => roleNames.Contains(role.Name, StringComparer.OrdinalIgnoreCase))
                .ToDictionary(role => role.Name, StringComparer.OrdinalIgnoreCase);

            return Task.FromResult(roles);
        }

        public void AddUser(User user) => Users.Add(user);

        public void RemoveUserRole(UserRole userRole)
        {
            userRole.User.UserRoles.Remove(userRole);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public User SeedUser(string userName, bool isActive, string passwordHash, IReadOnlyCollection<string> roles)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = userName,
                PasswordHash = passwordHash,
                IsActive = isActive,
                CreatedAtUtc = DateTimeOffset.UtcNow,
            };

            foreach (var roleName in roles)
            {
                var role = _roles.Single(existingRole => string.Equals(existingRole.Name, roleName, StringComparison.OrdinalIgnoreCase));
                user.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = role.Id,
                    User = user,
                    Role = role,
                });
            }

            Users.Add(user);
            return user;
        }
    }

    private sealed class InMemoryRefreshTokenRepository : IRefreshTokenRepository
    {
        public List<RefreshToken> StoredTokens { get; } = [];

        public Task<RefreshToken?> FindTrackedByTokenHashAsync(string tokenHash, CancellationToken cancellationToken) =>
            Task.FromResult(StoredTokens.SingleOrDefault(token => token.TokenHash == tokenHash));

        public Task<int> RevokeActiveTokensForUserAsync(
            Guid userId,
            DateTimeOffset revokedAtUtc,
            CancellationToken cancellationToken)
        {
            var activeTokens = StoredTokens
                .Where(token => token.UserId == userId && token.IsActiveAt(revokedAtUtc))
                .ToArray();

            foreach (var activeToken in activeTokens)
            {
                activeToken.Revoke(revokedAtUtc);
            }

            return Task.FromResult(activeTokens.Length);
        }

        public void Add(RefreshToken refreshToken) => StoredTokens.Add(refreshToken);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakePasswordHasher : IPasswordHasher
    {
        public string HashPassword(User user, string password) => $"hashed:{password}";

        public bool VerifyPassword(User user, string password) => true;
    }

    private sealed class CollectingAuditLogWriter : IAuditLogWriter
    {
        public List<AuditLogWriteEntry> Entries { get; } = [];

        public void Write(AuditLogWriteEntry entry) => Entries.Add(entry);
    }
}
