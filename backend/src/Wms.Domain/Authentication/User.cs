namespace Wms.Domain.Authentication;

public sealed class User
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }

    public ICollection<UserRole> UserRoles { get; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; } = [];
}
