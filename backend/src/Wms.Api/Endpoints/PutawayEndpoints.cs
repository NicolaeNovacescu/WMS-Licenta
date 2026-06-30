using System.Security.Claims;
using Wms.Api.Contracts.PutawayTasks;
using Wms.Application.Putaway;
using Wms.Application.Putaway.Models;

namespace Wms.Api.Endpoints;

public static class PutawayEndpoints
{
    private static readonly string[] PutawayReadRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapPutawayEndpoints(this IEndpointRouteBuilder app)
    {
        var putawayGroup = app.MapGroup("/api/putaway-tasks");

        putawayGroup.MapGet(string.Empty, GetPutawayTasksAsync)
            .RequireAuthorization(policy => policy.RequireRole(PutawayReadRoles));
        putawayGroup.MapGet("/{id:guid}", GetPutawayTaskByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(PutawayReadRoles));
        putawayGroup.MapPost(string.Empty, CreatePutawayTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        putawayGroup.MapPatch("/{id:guid}/start", StartPutawayTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        putawayGroup.MapPatch("/{id:guid}/complete", CompletePutawayTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        putawayGroup.MapPatch("/{id:guid}/cancel", CancelPutawayTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));

        return app;
    }

    private static async Task<IResult> GetPutawayTasksAsync(
        PutawayWorkflowService service,
        CancellationToken cancellationToken)
    {
        var putawayTasks = await service.ListPutawayTasksAsync(cancellationToken);
        return Results.Ok(putawayTasks.Select(ToResponse));
    }

    private static async Task<IResult> GetPutawayTaskByIdAsync(
        Guid id,
        PutawayWorkflowService service,
        CancellationToken cancellationToken)
    {
        var putawayTask = await service.GetPutawayTaskByIdAsync(id, cancellationToken);
        return putawayTask is null ? Results.NotFound() : Results.Ok(ToResponse(putawayTask));
    }

    private static async Task<IResult> CreatePutawayTaskAsync(
        CreatePutawayTaskRequest request,
        PutawayWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var putawayTask = await service.CreatePutawayTaskAsync(
                new CreatePutawayTaskCommand(
                    request.ProductId,
                    request.SourceLocationId,
                    request.DestinationLocationId,
                    request.ReceiptLineId,
                    request.Quantity,
                    request.Notes),
                cancellationToken);

            return Results.Created($"/api/putaway-tasks/{putawayTask.Id}", ToResponse(putawayTask));
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

    private static async Task<IResult> StartPutawayTaskAsync(
        Guid id,
        PutawayWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var putawayTask = await service.StartPutawayTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(putawayTask));
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

    private static async Task<IResult> CompletePutawayTaskAsync(
        Guid id,
        ClaimsPrincipal user,
        PutawayWorkflowService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(user, out var currentUserId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var putawayTask = await service.CompletePutawayTaskAsync(id, currentUserId, cancellationToken);
            return Results.Ok(ToResponse(putawayTask));
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

    private static async Task<IResult> CancelPutawayTaskAsync(
        Guid id,
        PutawayWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var putawayTask = await service.CancelPutawayTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(putawayTask));
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

    private static PutawayTaskResponse ToResponse(PutawayTaskDto putawayTask) =>
        new(
            putawayTask.Id,
            putawayTask.ProductId,
            putawayTask.ProductSku,
            putawayTask.ProductName,
            putawayTask.SourceLocationId,
            putawayTask.SourceWarehouseCode,
            putawayTask.SourceZoneCode,
            putawayTask.SourceLocationCode,
            putawayTask.SourceLocationName,
            putawayTask.SourceLocationType,
            putawayTask.SourceLocationIsActive,
            putawayTask.SourceLocationIsBlocked,
            putawayTask.DestinationLocationId,
            putawayTask.DestinationWarehouseCode,
            putawayTask.DestinationZoneCode,
            putawayTask.DestinationLocationCode,
            putawayTask.DestinationLocationName,
            putawayTask.DestinationLocationType,
            putawayTask.DestinationLocationIsActive,
            putawayTask.DestinationLocationIsBlocked,
            putawayTask.ReceiptLineId,
            putawayTask.ReceiptId,
            putawayTask.Quantity,
            putawayTask.Status,
            putawayTask.Notes,
            putawayTask.CreatedAtUtc,
            putawayTask.StartedAtUtc,
            putawayTask.CompletedAtUtc,
            putawayTask.CancelledAtUtc);

    private static bool TryGetCurrentUserId(ClaimsPrincipal user, out Guid currentUserId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out currentUserId);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
