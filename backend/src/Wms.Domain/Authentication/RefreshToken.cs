namespace Wms.Domain.Authentication;

public sealed class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset ExpiresAtUtc { get; set; }
    public DateTimeOffset? RevokedAtUtc { get; private set; }

    public User User { get; set; } = default!;

    public bool IsActiveAt(DateTimeOffset utcNow) =>
        RevokedAtUtc is null && ExpiresAtUtc > utcNow;

    public void Revoke(DateTimeOffset revokedAtUtc)
    {
        if (RevokedAtUtc is null)
        {
            RevokedAtUtc = revokedAtUtc;
        }
    }
}
