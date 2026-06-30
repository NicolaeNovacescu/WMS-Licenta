using Wms.Domain.Authentication;

namespace Wms.Application.Authentication.Abstractions;

public interface IPasswordHasher
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string password);
}
