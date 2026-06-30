using Wms.Api.Contracts.PickingTasks;
using Wms.Application.Picking;
using Wms.Application.Picking.Models;

namespace Wms.Api.Endpoints;

public static class PickingEndpoints
{
    private static readonly string[] PickingReadRoles = ["Admin", "Warehouse"];
    private static readonly string[] PickingCreateRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapPickingEndpoints(this IEndpointRouteBuilder app)
    {
        var pickingGroup = app.MapGroup("/api/picking-tasks");

        pickingGroup.MapGet(string.Empty, GetPickingTasksAsync)
            .RequireAuthorization(policy => policy.RequireRole(PickingReadRoles));
        pickingGroup.MapGet("/{id:guid}", GetPickingTaskByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(PickingReadRoles));
        pickingGroup.MapPost(string.Empty, CreatePickingTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole(PickingCreateRoles));
        pickingGroup.MapPatch("/{id:guid}/start", StartPickingTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        pickingGroup.MapPatch("/{id:guid}/complete", CompletePickingTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        pickingGroup.MapPatch("/{id:guid}/cancel", CancelPickingTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));

        return app;
    }

    private static async Task<IResult> GetPickingTasksAsync(
        PickingWorkflowService service,
        CancellationToken cancellationToken)
    {
        var pickingTasks = await service.ListPickingTasksAsync(cancellationToken);
        return Results.Ok(pickingTasks.Select(ToResponse));
    }

    private static async Task<IResult> GetPickingTaskByIdAsync(
        Guid id,
        PickingWorkflowService service,
        CancellationToken cancellationToken)
    {
        var pickingTask = await service.GetPickingTaskByIdAsync(id, cancellationToken);
        return pickingTask is null ? Results.NotFound() : Results.Ok(ToResponse(pickingTask));
    }

    private static async Task<IResult> CreatePickingTaskAsync(
        CreatePickingTaskRequest request,
        PickingWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var pickingTask = await service.CreatePickingTaskAsync(
                new CreatePickingTaskCommand(
                    request.SalesOrderId,
                    request.Lines?
                        .Select(line => new CreatePickingTaskLineCommand(line.SalesOrderReservationId, line.QuantityToPick))
                        .ToArray() ?? []),
                cancellationToken);

            return Results.Created($"/api/picking-tasks/{pickingTask.Id}", ToResponse(pickingTask));
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

    private static async Task<IResult> StartPickingTaskAsync(
        Guid id,
        PickingWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var pickingTask = await service.StartPickingTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(pickingTask));
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

    private static async Task<IResult> CompletePickingTaskAsync(
        Guid id,
        PickingWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var pickingTask = await service.CompletePickingTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(pickingTask));
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

    private static async Task<IResult> CancelPickingTaskAsync(
        Guid id,
        PickingWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var pickingTask = await service.CancelPickingTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(pickingTask));
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

    private static PickingTaskResponse ToResponse(PickingTaskDto pickingTask) =>
        new(
            pickingTask.Id,
            pickingTask.SalesOrderId,
            pickingTask.SalesOrderStatus,
            pickingTask.Status,
            pickingTask.CreatedAtUtc,
            pickingTask.StartedAtUtc,
            pickingTask.CompletedAtUtc,
            pickingTask.CancelledAtUtc,
            pickingTask.Lines
                .Select(line => new PickingTaskLineResponse(
                    line.Id,
                    line.SalesOrderLineId,
                    line.SalesOrderReservationId,
                    line.InventoryBalanceId,
                    line.ProductId,
                    line.ProductSku,
                    line.ProductName,
                    line.SourceLocationId,
                    line.SourceWarehouseCode,
                    line.SourceZoneCode,
                    line.SourceLocationCode,
                    line.SourceLocationName,
                    line.SourceLocationType,
                    line.SourceLocationIsActive,
                    line.SourceLocationIsBlocked,
                    line.QuantityToPick,
                    line.PickedQuantity))
                .ToArray());

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
