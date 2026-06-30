using System.Security.Claims;
using Wms.Api.Contracts.TransferTasks;
using Wms.Application.Transfer;
using Wms.Application.Transfer.Models;

namespace Wms.Api.Endpoints;

public static class TransferEndpoints
{
    private static readonly string[] TransferReadRoles = ["Admin", "Warehouse"];
    private static readonly string[] TransferCreateRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapTransferEndpoints(this IEndpointRouteBuilder app)
    {
        var transferGroup = app.MapGroup("/api/transfer-tasks");

        transferGroup.MapGet(string.Empty, GetTransferTasksAsync)
            .RequireAuthorization(policy => policy.RequireRole(TransferReadRoles));
        transferGroup.MapGet("/{id:guid}", GetTransferTaskByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(TransferReadRoles));
        transferGroup.MapPost(string.Empty, CreateTransferTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole(TransferCreateRoles));
        transferGroup.MapPatch("/{id:guid}/start", StartTransferTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        transferGroup.MapPatch("/{id:guid}/complete", CompleteTransferTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        transferGroup.MapPatch("/{id:guid}/cancel", CancelTransferTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));

        return app;
    }

    private static async Task<IResult> GetTransferTasksAsync(
        TransferWorkflowService service,
        CancellationToken cancellationToken)
    {
        var transferTasks = await service.ListTransferTasksAsync(cancellationToken);
        return Results.Ok(transferTasks.Select(ToResponse));
    }

    private static async Task<IResult> GetTransferTaskByIdAsync(
        Guid id,
        TransferWorkflowService service,
        CancellationToken cancellationToken)
    {
        var transferTask = await service.GetTransferTaskByIdAsync(id, cancellationToken);
        return transferTask is null ? Results.NotFound() : Results.Ok(ToResponse(transferTask));
    }

    private static async Task<IResult> CreateTransferTaskAsync(
        CreateTransferTaskRequest request,
        TransferWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var transferTask = await service.CreateTransferTaskAsync(
                new CreateTransferTaskCommand(
                    request.ProductId,
                    request.SourceLocationId,
                    request.DestinationLocationId,
                    request.Quantity,
                    request.Reason),
                cancellationToken);

            return Results.Created($"/api/transfer-tasks/{transferTask.Id}", ToResponse(transferTask));
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

    private static async Task<IResult> StartTransferTaskAsync(
        Guid id,
        TransferWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var transferTask = await service.StartTransferTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(transferTask));
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

    private static async Task<IResult> CompleteTransferTaskAsync(
        Guid id,
        ClaimsPrincipal user,
        TransferWorkflowService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(user, out var currentUserId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var transferTask = await service.CompleteTransferTaskAsync(id, currentUserId, cancellationToken);
            return Results.Ok(ToResponse(transferTask));
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

    private static async Task<IResult> CancelTransferTaskAsync(
        Guid id,
        TransferWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var transferTask = await service.CancelTransferTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(transferTask));
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

    private static TransferTaskResponse ToResponse(TransferTaskDto transferTask) =>
        new(
            transferTask.Id,
            transferTask.ProductId,
            transferTask.ProductSku,
            transferTask.ProductName,
            transferTask.SourceLocationId,
            transferTask.SourceWarehouseCode,
            transferTask.SourceZoneCode,
            transferTask.SourceLocationCode,
            transferTask.SourceLocationName,
            transferTask.SourceLocationType,
            transferTask.SourceLocationIsActive,
            transferTask.SourceLocationIsBlocked,
            transferTask.DestinationLocationId,
            transferTask.DestinationWarehouseCode,
            transferTask.DestinationZoneCode,
            transferTask.DestinationLocationCode,
            transferTask.DestinationLocationName,
            transferTask.DestinationLocationType,
            transferTask.DestinationLocationIsActive,
            transferTask.DestinationLocationIsBlocked,
            transferTask.Quantity,
            transferTask.Status,
            transferTask.Reason,
            transferTask.CreatedAtUtc,
            transferTask.StartedAtUtc,
            transferTask.CompletedAtUtc,
            transferTask.CancelledAtUtc);

    private static bool TryGetCurrentUserId(ClaimsPrincipal user, out Guid currentUserId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out currentUserId);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
