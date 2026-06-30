using Wms.Api.Contracts.Users;
using Wms.Application.Authentication;
using Wms.Application.Authentication.Models;

namespace Wms.Api.Endpoints;

public static class UserManagementEndpoints
{
    public static IEndpointRouteBuilder MapUserManagementEndpoints(this IEndpointRouteBuilder app)
    {
        var userGroup = app.MapGroup("/api/users")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        userGroup.MapGet(string.Empty, GetUsersAsync);
        userGroup.MapGet("/{id:guid}", GetUserByIdAsync);
        userGroup.MapPost(string.Empty, CreateUserAsync);
        userGroup.MapPut("/{id:guid}", UpdateUserAsync);
        userGroup.MapPatch("/{id:guid}/activate", ActivateUserAsync);
        userGroup.MapPatch("/{id:guid}/deactivate", DeactivateUserAsync);

        return app;
    }

    private static async Task<IResult> GetUsersAsync(
        UserManagementService service,
        CancellationToken cancellationToken)
    {
        var users = await service.ListUsersAsync(cancellationToken);
        return Results.Ok(users.Select(ToResponse));
    }

    private static async Task<IResult> GetUserByIdAsync(
        Guid id,
        UserManagementService service,
        CancellationToken cancellationToken)
    {
        var user = await service.GetUserByIdAsync(id, cancellationToken);
        return user is null ? Results.NotFound() : Results.Ok(ToResponse(user));
    }

    private static async Task<IResult> CreateUserAsync(
        CreateUserRequest request,
        UserManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await service.CreateUserAsync(
                new CreateUserCommand(request.UserName, request.Password, request.Roles),
                cancellationToken);

            return Results.Created($"/api/users/{user.Id}", ToResponse(user));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static async Task<IResult> UpdateUserAsync(
        Guid id,
        UpdateUserRequest request,
        UserManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await service.UpdateUserAsync(
                id,
                new UpdateUserCommand(request.UserName, request.Password, request.Roles),
                cancellationToken);

            return Results.Ok(ToResponse(user));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static async Task<IResult> ActivateUserAsync(
        Guid id,
        UserManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await service.ActivateUserAsync(id, cancellationToken);
            return Results.Ok(ToResponse(user));
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static async Task<IResult> DeactivateUserAsync(
        Guid id,
        UserManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await service.DeactivateUserAsync(id, cancellationToken);
            return Results.Ok(ToResponse(user));
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static UserResponse ToResponse(UserManagementDto user) =>
        new(user.Id, user.UserName, user.IsActive, user.CreatedAtUtc, user.Roles);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
