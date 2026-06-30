using Wms.Application.Authentication.Models;
using Wms.Domain.Authentication;

namespace Wms.Application.Authentication.Abstractions;

public interface ITokenFactory
{
    AuthTokens CreateTokens(User user, IReadOnlyCollection<string> roles);
    string ComputeRefreshTokenHash(string refreshToken);
}
