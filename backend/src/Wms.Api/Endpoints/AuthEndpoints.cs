using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Wms.Api.Contracts.Auth;
using Wms.Application.Authentication.Abstractions;
using Wms.Application.Authentication.Models;

namespace Wms.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", LoginAsync).AllowAnonymous();
        group.MapPost("/refresh", RefreshAsync).AllowAnonymous();
        group.MapPost("/logout", LogoutAsync).RequireAuthorization();
        group.MapGet("/me", MeAsync).RequireAuthorization();

        return app;
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["credentials"] = ["Username and password are required."]
            });
        }

        var session = await authService.LoginAsync(
            new LoginCommand(request.UserName, request.Password),
            cancellationToken);

        return session is null ? Results.Unauthorized() : Results.Ok(ToResponse(session));
    }

    private static async Task<IResult> RefreshAsync(
        RefreshRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["refreshToken"] = ["Refresh token is required."]
            });
        }

        var session = await authService.RefreshAsync(new RefreshCommand(request.RefreshToken), cancellationToken);
        return session is null ? Results.Unauthorized() : Results.Ok(ToResponse(session));
    }

    private static async Task<IResult> LogoutAsync(
        ClaimsPrincipal principal,
        LogoutRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["refreshToken"] = ["Refresh token is required."]
            });
        }

        if (!TryGetUserId(principal, out var userId))
        {
            return Results.Unauthorized();
        }

        await authService.LogoutAsync(userId, request.RefreshToken, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> MeAsync(
        ClaimsPrincipal principal,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId))
        {
            return Results.Unauthorized();
        }

        var currentUser = await authService.GetCurrentUserAsync(userId, cancellationToken);
        return currentUser is null
            ? Results.Unauthorized()
            : Results.Ok(new CurrentUserResponse(currentUser.UserId, currentUser.UserName, currentUser.Roles));
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);

        return Guid.TryParse(value, out userId);
    }

    private static AuthResponse ToResponse(AuthSession session) =>
        new(
            session.AccessToken,
            session.AccessTokenExpiresAtUtc,
            session.RefreshToken,
            session.RefreshTokenExpiresAtUtc,
            new CurrentUserResponse(session.UserId, session.UserName, session.Roles));
}
