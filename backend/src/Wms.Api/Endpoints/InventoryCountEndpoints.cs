using System.Security.Claims;
using Wms.Api.Contracts.InventoryCounts;
using Wms.Application.InventoryCount;
using Wms.Application.InventoryCount.Models;

namespace Wms.Api.Endpoints;

public static class InventoryCountEndpoints
{
    private static readonly string[] InventoryCountReadRoles = ["Admin", "Warehouse"];
    private static readonly string[] InventoryCountCreateRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapInventoryCountEndpoints(this IEndpointRouteBuilder app)
    {
        var inventoryCountGroup = app.MapGroup("/api/inventory-counts");

        inventoryCountGroup.MapGet(string.Empty, GetInventoryCountsAsync)
            .RequireAuthorization(policy => policy.RequireRole(InventoryCountReadRoles));
        inventoryCountGroup.MapGet("/{id:guid}", GetInventoryCountByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(InventoryCountReadRoles));
        inventoryCountGroup.MapPost(string.Empty, CreateInventoryCountAsync)
            .RequireAuthorization(policy => policy.RequireRole(InventoryCountCreateRoles));
        inventoryCountGroup.MapPatch("/{id:guid}/start", StartInventoryCountAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        inventoryCountGroup.MapPatch("/{id:guid}/complete", CompleteInventoryCountAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        inventoryCountGroup.MapPatch("/{id:guid}/cancel", CancelInventoryCountAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));

        return app;
    }

    private static async Task<IResult> GetInventoryCountsAsync(
        InventoryCountWorkflowService service,
        CancellationToken cancellationToken)
    {
        var inventoryCounts = await service.ListInventoryCountsAsync(cancellationToken);
        return Results.Ok(inventoryCounts.Select(ToResponse));
    }

    private static async Task<IResult> GetInventoryCountByIdAsync(
        Guid id,
        InventoryCountWorkflowService service,
        CancellationToken cancellationToken)
    {
        var inventoryCount = await service.GetInventoryCountByIdAsync(id, cancellationToken);
        return inventoryCount is null ? Results.NotFound() : Results.Ok(ToResponse(inventoryCount));
    }

    private static async Task<IResult> CreateInventoryCountAsync(
        CreateInventoryCountRequest request,
        InventoryCountWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var inventoryCount = await service.CreateInventoryCountAsync(
                new CreateInventoryCountCommand(
                    request.Lines?
                        .Select(line => new CreateInventoryCountLineCommand(line.ProductId, line.LocationId))
                        .ToArray() ?? []),
                cancellationToken);

            return Results.Created($"/api/inventory-counts/{inventoryCount.Id}", ToResponse(inventoryCount));
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

    private static async Task<IResult> StartInventoryCountAsync(
        Guid id,
        InventoryCountWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var inventoryCount = await service.StartInventoryCountAsync(id, cancellationToken);
            return Results.Ok(ToResponse(inventoryCount));
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

    private static async Task<IResult> CompleteInventoryCountAsync(
        Guid id,
        CompleteInventoryCountRequest request,
        ClaimsPrincipal user,
        InventoryCountWorkflowService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(user, out var currentUserId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var inventoryCount = await service.CompleteInventoryCountAsync(
                id,
                new CompleteInventoryCountCommand(
                    request.Lines?
                        .Select(line => new CompleteInventoryCountLineCommand(line.InventoryCountLineId, line.CountedQuantity))
                        .ToArray() ?? []),
                currentUserId,
                cancellationToken);

            return Results.Ok(ToResponse(inventoryCount));
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

    private static async Task<IResult> CancelInventoryCountAsync(
        Guid id,
        InventoryCountWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var inventoryCount = await service.CancelInventoryCountAsync(id, cancellationToken);
            return Results.Ok(ToResponse(inventoryCount));
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

    private static InventoryCountResponse ToResponse(InventoryCountDto inventoryCount) =>
        new(
            inventoryCount.Id,
            inventoryCount.Status,
            inventoryCount.CreatedAtUtc,
            inventoryCount.StartedAtUtc,
            inventoryCount.CompletedAtUtc,
            inventoryCount.CancelledAtUtc,
            inventoryCount.Lines
                .Select(line => new InventoryCountLineResponse(
                    line.Id,
                    line.ProductId,
                    line.ProductSku,
                    line.ProductName,
                    line.LocationId,
                    line.WarehouseCode,
                    line.ZoneCode,
                    line.LocationCode,
                    line.LocationName,
                    line.LocationType,
                    line.LocationIsActive,
                    line.LocationIsBlocked,
                    line.InventoryBalanceId,
                    line.ExpectedSystemQuantity,
                    line.CountedQuantity,
                    line.VarianceQuantity))
                .ToArray());

    private static bool TryGetCurrentUserId(ClaimsPrincipal user, out Guid currentUserId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out currentUserId);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
