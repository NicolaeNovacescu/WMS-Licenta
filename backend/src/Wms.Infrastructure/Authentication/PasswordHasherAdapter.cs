using Microsoft.AspNetCore.Identity;
using Wms.Application.Authentication.Abstractions;
using Wms.Domain.Authentication;

namespace Wms.Infrastructure.Authentication;

public sealed class PasswordHasherAdapter : IPasswordHasher
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public string HashPassword(User user, string password) =>
        _passwordHasher.HashPassword(user, password);

    public bool VerifyPassword(User user, string password)
    {
        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
        return verificationResult is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
