using System.Security.Claims;
using Wms.Api.Contracts.Shipments;
using Wms.Application.Shipment;
using Wms.Application.Shipment.Models;

namespace Wms.Api.Endpoints;

public static class ShipmentEndpoints
{
    private static readonly string[] ShipmentReadRoles = ["Admin", "Warehouse"];
    private static readonly string[] ShipmentCreateRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapShipmentEndpoints(this IEndpointRouteBuilder app)
    {
        var shipmentGroup = app.MapGroup("/api/shipments");

        shipmentGroup.MapGet(string.Empty, GetShipmentsAsync)
            .RequireAuthorization(policy => policy.RequireRole(ShipmentReadRoles));
        shipmentGroup.MapGet("/{id:guid}", GetShipmentByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(ShipmentReadRoles));
        shipmentGroup.MapPost(string.Empty, CreateShipmentAsync)
            .RequireAuthorization(policy => policy.RequireRole(ShipmentCreateRoles));
        shipmentGroup.MapPatch("/{id:guid}/start", StartShipmentAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        shipmentGroup.MapPatch("/{id:guid}/complete", CompleteShipmentAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));
        shipmentGroup.MapPatch("/{id:guid}/cancel", CancelShipmentAsync)
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));

        return app;
    }

    private static async Task<IResult> GetShipmentsAsync(
        ShipmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        var shipments = await service.ListShipmentsAsync(cancellationToken);
        return Results.Ok(shipments.Select(ToResponse));
    }

    private static async Task<IResult> GetShipmentByIdAsync(
        Guid id,
        ShipmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        var shipment = await service.GetShipmentByIdAsync(id, cancellationToken);
        return shipment is null ? Results.NotFound() : Results.Ok(ToResponse(shipment));
    }

    private static async Task<IResult> CreateShipmentAsync(
        CreateShipmentRequest request,
        ShipmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var shipment = await service.CreateShipmentAsync(
                new CreateShipmentCommand(
                    request.SalesOrderId,
                    request.Lines?
                        .Select(line => new CreateShipmentLineCommand(line.PickingTaskLineId, line.QuantityToShip))
                        .ToArray() ?? []),
                cancellationToken);

            return Results.Created($"/api/shipments/{shipment.Id}", ToResponse(shipment));
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

    private static async Task<IResult> StartShipmentAsync(
        Guid id,
        ShipmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var shipment = await service.StartShipmentAsync(id, cancellationToken);
            return Results.Ok(ToResponse(shipment));
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

    private static async Task<IResult> CompleteShipmentAsync(
        Guid id,
        ClaimsPrincipal user,
        ShipmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(user, out var currentUserId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var shipment = await service.CompleteShipmentAsync(id, currentUserId, cancellationToken);
            return Results.Ok(ToResponse(shipment));
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

    private static async Task<IResult> CancelShipmentAsync(
        Guid id,
        ShipmentWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var shipment = await service.CancelShipmentAsync(id, cancellationToken);
            return Results.Ok(ToResponse(shipment));
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

    private static ShipmentResponse ToResponse(ShipmentDto shipment) =>
        new(
            shipment.Id,
            shipment.SalesOrderId,
            shipment.SalesOrderStatus,
            shipment.Status,
            shipment.CreatedAtUtc,
            shipment.StartedAtUtc,
            shipment.CompletedAtUtc,
            shipment.CancelledAtUtc,
            shipment.Lines
                .Select(line => new ShipmentLineResponse(
                    line.Id,
                    line.PickingTaskLineId,
                    line.PickingTaskId,
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
                    line.QuantityToShip,
                    line.ShippedQuantity))
                .ToArray());

    private static bool TryGetCurrentUserId(ClaimsPrincipal user, out Guid currentUserId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out currentUserId);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
