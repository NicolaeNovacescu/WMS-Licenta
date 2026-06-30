using Wms.Application.Authentication;
using Wms.Application.Authentication.Abstractions;
using Wms.Application.Authentication.Models;
using Wms.Domain.Authentication;
using Xunit;

namespace Wms.Application.Tests.Authentication;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_ReturnsSession_ForActiveUserWithValidPassword()
    {
        var user = BuildUser(isActive: true);
        var refreshTokenRepository = new InMemoryRefreshTokenRepository();
        var authService = new AuthService(
            new InMemoryUserRepository(user),
            refreshTokenRepository,
            new FakePasswordHasher(shouldVerify: true),
            new FakeTokenFactory());

        var session = await authService.LoginAsync(new LoginCommand("admin", "password"), CancellationToken.None);

        Assert.NotNull(session);
        Assert.Equal(user.Id, session.UserId);
        Assert.Equal("admin", session.UserName);
        Assert.Contains("Admin", session.Roles);
        Assert.Single(refreshTokenRepository.StoredTokens);
        Assert.Equal(user.Id, refreshTokenRepository.StoredTokens[0].UserId);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_ForInactiveUser()
    {
        var refreshTokenRepository = new InMemoryRefreshTokenRepository();
        var authService = new AuthService(
            new InMemoryUserRepository(BuildUser(isActive: false)),
            refreshTokenRepository,
            new FakePasswordHasher(shouldVerify: true),
            new FakeTokenFactory());

        var session = await authService.LoginAsync(new LoginCommand("admin", "password"), CancellationToken.None);

        Assert.Null(session);
        Assert.Empty(refreshTokenRepository.StoredTokens);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_ForInvalidPassword()
    {
        var refreshTokenRepository = new InMemoryRefreshTokenRepository();
        var authService = new AuthService(
            new InMemoryUserRepository(BuildUser(isActive: true)),
            refreshTokenRepository,
            new FakePasswordHasher(shouldVerify: false),
            new FakeTokenFactory());

        var session = await authService.LoginAsync(new LoginCommand("admin", "wrong-password"), CancellationToken.None);

        Assert.Null(session);
        Assert.Empty(refreshTokenRepository.StoredTokens);
    }

    private static User BuildUser(bool isActive) =>
        new()
        {
            Id = Guid.NewGuid(),
            UserName = "admin",
            PasswordHash = "hashed-password",
            IsActive = isActive,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            UserRoles =
            {
                new UserRole
                {
                    RoleId = Guid.NewGuid(),
                    Role = new Role
                    {
                        Id = Guid.NewGuid(),
                        Name = "Admin",
                    },
                },
            },
        };

    private sealed class InMemoryUserRepository(User? user) : IUserAuthRepository
    {
        public Task<User?> FindByUserNameAsync(string userName, CancellationToken cancellationToken) =>
            Task.FromResult(user is not null && user.UserName == userName ? user : null);

        public Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken) =>
            Task.FromResult(user is not null && user.Id == userId ? user : null);
    }

    private sealed class InMemoryRefreshTokenRepository : IRefreshTokenRepository
    {
        public List<RefreshToken> StoredTokens { get; } = [];

        public Task<RefreshToken?> FindTrackedByTokenHashAsync(string tokenHash, CancellationToken cancellationToken) =>
            Task.FromResult(StoredTokens.SingleOrDefault(token => token.TokenHash == tokenHash));

        public Task<int> RevokeActiveTokensForUserAsync(
            Guid userId,
            DateTimeOffset revokedAtUtc,
            CancellationToken cancellationToken) =>
            Task.FromResult(0);

        public void Add(RefreshToken refreshToken) => StoredTokens.Add(refreshToken);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakePasswordHasher(bool shouldVerify) : IPasswordHasher
    {
        public string HashPassword(User user, string password) => "hashed";

        public bool VerifyPassword(User user, string password) => shouldVerify;
    }

    private sealed class FakeTokenFactory : ITokenFactory
    {
        public AuthTokens CreateTokens(User user, IReadOnlyCollection<string> roles) =>
            new(
                "access-token",
                DateTimeOffset.UtcNow.AddMinutes(15),
                "refresh-token",
                "refresh-hash",
                DateTimeOffset.UtcNow.AddDays(7),
                DateTimeOffset.UtcNow);

        public string ComputeRefreshTokenHash(string refreshToken) => "refresh-hash";
    }
}
