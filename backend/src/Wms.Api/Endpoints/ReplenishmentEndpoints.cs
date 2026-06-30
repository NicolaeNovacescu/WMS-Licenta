using System.Security.Claims;
using Wms.Api.Contracts.ReplenishmentRules;
using Wms.Api.Contracts.ReplenishmentTasks;
using Wms.Application.Replenishment;
using Wms.Application.Replenishment.Models;

namespace Wms.Api.Endpoints;

public static class ReplenishmentEndpoints
{
    private static readonly string[] ReplenishmentTaskReadRoles = ["Admin", "Warehouse"];
    private static readonly string[] ReplenishmentTaskCreateRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapReplenishmentEndpoints(this IEndpointRouteBuilder app)
    {
        var replenishmentRulesGroup = app.MapGroup("/api/replenishment-rules")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        replenishmentRulesGroup.MapGet(string.Empty, GetReplenishmentRulesAsync);
        replenishmentRulesGroup.MapGet("/{id:guid}", GetReplenishmentRuleByIdAsync);
        replenishmentRulesGroup.MapPost(string.Empty, CreateReplenishmentRuleAsync);
        replenishmentRulesGroup.MapPut("/{id:guid}", UpdateReplenishmentRuleAsync);
        replenishmentRulesGroup.MapPatch("/{id:guid}/deactivate", DeactivateReplenishmentRuleAsync);

        var replenishmentTasksGroup = app.MapGroup("/api/replenishment-tasks");

        replenishmentTasksGroup.MapGet(string.Empty, GetReplenishmentTasksAsync)
            .RequireAuthorization(policy => policy.RequireRole(ReplenishmentTaskReadRoles));
        replenishmentTasksGroup.MapGet("/{id:guid}", GetReplenishmentTaskByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(ReplenishmentTaskReadRoles));
        replenishmentTasksGroup.MapPost(string.Empty, CreateReplenishmentTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole(ReplenishmentTaskCreateRoles));
        replenishmentTasksGroup.MapPatch("/{id:guid}/start", StartReplenishmentTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        replenishmentTasksGroup.MapPatch("/{id:guid}/complete", CompleteReplenishmentTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        replenishmentTasksGroup.MapPatch("/{id:guid}/cancel", CancelReplenishmentTaskAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));

        return app;
    }

    private static async Task<IResult> GetReplenishmentRulesAsync(
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        var replenishmentRules = await service.ListReplenishmentRulesAsync(cancellationToken);
        return Results.Ok(replenishmentRules.Select(ToResponse));
    }

    private static async Task<IResult> GetReplenishmentRuleByIdAsync(
        Guid id,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        var replenishmentRule = await service.GetReplenishmentRuleByIdAsync(id, cancellationToken);
        return replenishmentRule is null ? Results.NotFound() : Results.Ok(ToResponse(replenishmentRule));
    }

    private static async Task<IResult> CreateReplenishmentRuleAsync(
        CreateReplenishmentRuleRequest request,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var replenishmentRule = await service.CreateReplenishmentRuleAsync(
                new CreateReplenishmentRuleCommand(
                    request.ProductId,
                    request.TargetLocationId,
                    request.MinimumThreshold,
                    request.TargetQuantity),
                cancellationToken);

            return Results.Created($"/api/replenishment-rules/{replenishmentRule.Id}", ToResponse(replenishmentRule));
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

    private static async Task<IResult> UpdateReplenishmentRuleAsync(
        Guid id,
        UpdateReplenishmentRuleRequest request,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var replenishmentRule = await service.UpdateReplenishmentRuleAsync(
                id,
                new UpdateReplenishmentRuleCommand(
                    request.ProductId,
                    request.TargetLocationId,
                    request.MinimumThreshold,
                    request.TargetQuantity),
                cancellationToken);

            return Results.Ok(ToResponse(replenishmentRule));
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

    private static async Task<IResult> DeactivateReplenishmentRuleAsync(
        Guid id,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var replenishmentRule = await service.DeactivateReplenishmentRuleAsync(id, cancellationToken);
            return Results.Ok(ToResponse(replenishmentRule));
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
    }

    private static async Task<IResult> GetReplenishmentTasksAsync(
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        var replenishmentTasks = await service.ListReplenishmentTasksAsync(cancellationToken);
        return Results.Ok(replenishmentTasks.Select(ToResponse));
    }

    private static async Task<IResult> GetReplenishmentTaskByIdAsync(
        Guid id,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        var replenishmentTask = await service.GetReplenishmentTaskByIdAsync(id, cancellationToken);
        return replenishmentTask is null ? Results.NotFound() : Results.Ok(ToResponse(replenishmentTask));
    }

    private static async Task<IResult> CreateReplenishmentTaskAsync(
        CreateReplenishmentTaskRequest request,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var replenishmentTask = await service.CreateReplenishmentTaskAsync(
                new CreateReplenishmentTaskCommand(
                    request.ProductId,
                    request.SourceLocationId,
                    request.TargetLocationId,
                    request.Quantity),
                cancellationToken);

            return Results.Created($"/api/replenishment-tasks/{replenishmentTask.Id}", ToResponse(replenishmentTask));
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

    private static async Task<IResult> StartReplenishmentTaskAsync(
        Guid id,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var replenishmentTask = await service.StartReplenishmentTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(replenishmentTask));
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

    private static async Task<IResult> CompleteReplenishmentTaskAsync(
        Guid id,
        ClaimsPrincipal user,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(user, out var currentUserId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var replenishmentTask = await service.CompleteReplenishmentTaskAsync(id, currentUserId, cancellationToken);
            return Results.Ok(ToResponse(replenishmentTask));
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

    private static async Task<IResult> CancelReplenishmentTaskAsync(
        Guid id,
        ReplenishmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var replenishmentTask = await service.CancelReplenishmentTaskAsync(id, cancellationToken);
            return Results.Ok(ToResponse(replenishmentTask));
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

    private static ReplenishmentRuleResponse ToResponse(ReplenishmentRuleDto replenishmentRule) =>
        new(
            replenishmentRule.Id,
            replenishmentRule.ProductId,
            replenishmentRule.ProductSku,
            replenishmentRule.ProductName,
            replenishmentRule.TargetLocationId,
            replenishmentRule.TargetWarehouseCode,
            replenishmentRule.TargetZoneCode,
            replenishmentRule.TargetLocationCode,
            replenishmentRule.TargetLocationName,
            replenishmentRule.TargetLocationType,
            replenishmentRule.TargetLocationIsActive,
            replenishmentRule.TargetLocationIsBlocked,
            replenishmentRule.MinimumThreshold,
            replenishmentRule.TargetQuantity,
            replenishmentRule.IsActive,
            replenishmentRule.CreatedAtUtc,
            replenishmentRule.UpdatedAtUtc);

    private static ReplenishmentTaskResponse ToResponse(ReplenishmentTaskDto replenishmentTask) =>
        new(
            replenishmentTask.Id,
            replenishmentTask.ReplenishmentRuleId,
            replenishmentTask.ProductId,
            replenishmentTask.ProductSku,
            replenishmentTask.ProductName,
            replenishmentTask.SourceLocationId,
            replenishmentTask.SourceWarehouseCode,
            replenishmentTask.SourceZoneCode,
            replenishmentTask.SourceLocationCode,
            replenishmentTask.SourceLocationName,
            replenishmentTask.SourceLocationType,
            replenishmentTask.SourceLocationIsActive,
            replenishmentTask.SourceLocationIsBlocked,
            replenishmentTask.TargetLocationId,
            replenishmentTask.TargetWarehouseCode,
            replenishmentTask.TargetZoneCode,
            replenishmentTask.TargetLocationCode,
            replenishmentTask.TargetLocationName,
            replenishmentTask.TargetLocationType,
            replenishmentTask.TargetLocationIsActive,
            replenishmentTask.TargetLocationIsBlocked,
            replenishmentTask.Quantity,
            replenishmentTask.Status,
            replenishmentTask.CreatedAtUtc,
            replenishmentTask.StartedAtUtc,
            replenishmentTask.CompletedAtUtc,
            replenishmentTask.CancelledAtUtc);

    private static bool TryGetCurrentUserId(ClaimsPrincipal user, out Guid currentUserId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out currentUserId);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
