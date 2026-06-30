using Wms.Api.Contracts.Inventory;
using Wms.Application.Inventory;
using Wms.Application.Inventory.Models;

namespace Wms.Api.Endpoints;

public static class InventoryEndpoints
{
    private static readonly string[] InventoryReadRoles = ["Admin", "Warehouse"];
    private static readonly string[] InventoryByProductRoles = ["Admin", "Warehouse", "Sales"];

    public static IEndpointRouteBuilder MapInventoryEndpoints(this IEndpointRouteBuilder app)
    {
        var inventoryGroup = app.MapGroup("/api/inventory");

        inventoryGroup.MapGet("/balances", GetBalancesAsync)
            .RequireAuthorization(policy => policy.RequireRole(InventoryReadRoles));
        inventoryGroup.MapGet("/by-product", GetInventoryByProductAsync)
            .RequireAuthorization(policy => policy.RequireRole(InventoryByProductRoles));
        inventoryGroup.MapGet("/by-location", GetInventoryByLocationAsync)
            .RequireAuthorization(policy => policy.RequireRole(InventoryReadRoles));
        inventoryGroup.MapGet("/movements", GetInventoryMovementsAsync)
            .RequireAuthorization(policy => policy.RequireRole(InventoryReadRoles));

        return app;
    }

    private static async Task<IResult> GetBalancesAsync(
        InventoryVisibilityService service,
        CancellationToken cancellationToken)
    {
        var balances = await service.ListBalancesAsync(cancellationToken);
        return Results.Ok(balances.Select(ToResponse));
    }

    private static async Task<IResult> GetInventoryByProductAsync(
        InventoryVisibilityService service,
        CancellationToken cancellationToken)
    {
        var balances = await service.ListByProductAsync(cancellationToken);
        return Results.Ok(balances.Select(ToResponse));
    }

    private static async Task<IResult> GetInventoryByLocationAsync(
        InventoryVisibilityService service,
        CancellationToken cancellationToken)
    {
        var balances = await service.ListByLocationAsync(cancellationToken);
        return Results.Ok(balances.Select(ToResponse));
    }

    private static async Task<IResult> GetInventoryMovementsAsync(
        Guid? productId,
        Guid? locationId,
        string? movementType,
        InventoryMovementHistoryService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var movements = await service.ListMovementsAsync(
                productId,
                locationId,
                movementType,
                cancellationToken);

            return Results.Ok(movements.Select(ToResponse));
        }
        catch (ArgumentException exception) when (exception.ParamName == "movementType")
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["movementType"] = [exception.Message],
            });
        }
    }

    private static InventoryBalanceResponse ToResponse(InventoryBalanceDto balance) =>
        new(
            balance.Id,
            balance.ProductId,
            balance.ProductSku,
            balance.ProductName,
            balance.LocationId,
            balance.WarehouseCode,
            balance.ZoneCode,
            balance.LocationCode,
            balance.LocationName,
            balance.LocationType,
            balance.LocationIsActive,
            balance.LocationIsBlocked,
            balance.OnHandQuantity,
            balance.ReservedQuantity,
            balance.PickedQuantity,
            balance.AvailableQuantity,
            balance.UpdatedAtUtc);

    private static InventoryByProductResponse ToResponse(InventoryByProductDto balance) =>
        new(
            balance.ProductId,
            balance.ProductSku,
            balance.ProductName,
            balance.OnHandQuantity,
            balance.ReservedQuantity,
            balance.PickedQuantity,
            balance.AvailableQuantity,
            balance.UpdatedAtUtc);

    private static InventoryByLocationResponse ToResponse(InventoryByLocationDto balance) =>
        new(
            balance.LocationId,
            balance.WarehouseCode,
            balance.ZoneCode,
            balance.LocationCode,
            balance.LocationName,
            balance.LocationType,
            balance.LocationIsActive,
            balance.LocationIsBlocked,
            balance.OnHandQuantity,
            balance.ReservedQuantity,
            balance.PickedQuantity,
            balance.AvailableQuantity,
            balance.UpdatedAtUtc);

    private static InventoryMovementResponse ToResponse(InventoryMovementDto movement) =>
        new(
            movement.Id,
            movement.ProductId,
            movement.ProductSku,
            movement.ProductName,
            movement.Quantity,
            movement.MovementType,
            movement.SourceLocationId,
            movement.SourceWarehouseCode,
            movement.SourceZoneCode,
            movement.SourceLocationCode,
            movement.SourceLocationName,
            movement.DestinationLocationId,
            movement.DestinationWarehouseCode,
            movement.DestinationZoneCode,
            movement.DestinationLocationCode,
            movement.DestinationLocationName,
            movement.ReferenceType,
            movement.ReferenceId,
            movement.PerformedAtUtc,
            movement.PerformedByUserId,
            movement.PerformedByUserName,
            movement.Notes);
}
