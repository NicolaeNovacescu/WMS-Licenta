using Wms.Api.Contracts.Locations;
using Wms.Api.Contracts.Warehouses;
using Wms.Api.Contracts.Zones;
using Wms.Application.WarehouseStructure;
using Wms.Application.WarehouseStructure.Models;

namespace Wms.Api.Endpoints;

public static class WarehouseStructureEndpoints
{
    private static readonly string[] WarehouseReadRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapWarehouseStructureEndpoints(this IEndpointRouteBuilder app)
    {
        var warehouseGroup = app.MapGroup("/api/warehouses");
        warehouseGroup.MapGet(string.Empty, GetWarehousesAsync)
            .RequireAuthorization(policy => policy.RequireRole(WarehouseReadRoles));
        warehouseGroup.MapPost(string.Empty, CreateWarehouseAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        warehouseGroup.MapPut("/{id:guid}", UpdateWarehouseAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        var zoneGroup = app.MapGroup("/api/zones");
        zoneGroup.MapGet(string.Empty, GetZonesAsync)
            .RequireAuthorization(policy => policy.RequireRole(WarehouseReadRoles));
        zoneGroup.MapPost(string.Empty, CreateZoneAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        zoneGroup.MapPut("/{id:guid}", UpdateZoneAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        var locationGroup = app.MapGroup("/api/locations");
        locationGroup.MapGet(string.Empty, GetLocationsAsync)
            .RequireAuthorization(policy => policy.RequireRole(WarehouseReadRoles));
        locationGroup.MapGet("/{id:guid}", GetLocationByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(WarehouseReadRoles));
        locationGroup.MapPost(string.Empty, CreateLocationAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        locationGroup.MapPut("/{id:guid}", UpdateLocationAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        locationGroup.MapPatch("/{id:guid}/block", BlockLocationAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        locationGroup.MapPatch("/{id:guid}/unblock", UnblockLocationAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        return app;
    }

    private static async Task<IResult> GetWarehousesAsync(
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        var warehouses = await service.ListWarehousesAsync(cancellationToken);
        return Results.Ok(warehouses.Select(warehouse => new WarehouseResponse(
            warehouse.Id,
            warehouse.Code,
            warehouse.Name,
            warehouse.IsActive)));
    }

    private static async Task<IResult> CreateWarehouseAsync(
        CreateWarehouseRequest request,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var warehouse = await service.CreateWarehouseAsync(
                new CreateWarehouseCommand(request.Code, request.Name, request.IsActive),
                cancellationToken);

            return Results.Created($"/api/warehouses/{warehouse.Id}", new WarehouseResponse(
                warehouse.Id,
                warehouse.Code,
                warehouse.Name,
                warehouse.IsActive));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
    }

    private static async Task<IResult> UpdateWarehouseAsync(
        Guid id,
        UpdateWarehouseRequest request,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var warehouse = await service.UpdateWarehouseAsync(
                id,
                new UpdateWarehouseCommand(request.Code, request.Name, request.IsActive),
                cancellationToken);

            return Results.Ok(new WarehouseResponse(
                warehouse.Id,
                warehouse.Code,
                warehouse.Name,
                warehouse.IsActive));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
    }

    private static async Task<IResult> GetZonesAsync(
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        var zones = await service.ListZonesAsync(cancellationToken);
        return Results.Ok(zones.Select(zone => new ZoneResponse(
            zone.Id,
            zone.WarehouseId,
            zone.WarehouseCode,
            zone.Code,
            zone.Name,
            zone.IsActive)));
    }

    private static async Task<IResult> CreateZoneAsync(
        CreateZoneRequest request,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var zone = await service.CreateZoneAsync(
                new CreateZoneCommand(request.WarehouseId, request.Code, request.Name, request.IsActive),
                cancellationToken);

            return Results.Created($"/api/zones/{zone.Id}", new ZoneResponse(
                zone.Id,
                zone.WarehouseId,
                zone.WarehouseCode,
                zone.Code,
                zone.Name,
                zone.IsActive));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
    }

    private static async Task<IResult> UpdateZoneAsync(
        Guid id,
        UpdateZoneRequest request,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var zone = await service.UpdateZoneAsync(
                id,
                new UpdateZoneCommand(request.WarehouseId, request.Code, request.Name, request.IsActive),
                cancellationToken);

            return Results.Ok(new ZoneResponse(
                zone.Id,
                zone.WarehouseId,
                zone.WarehouseCode,
                zone.Code,
                zone.Name,
                zone.IsActive));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
    }

    private static async Task<IResult> GetLocationsAsync(
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        var locations = await service.ListLocationsAsync(cancellationToken);
        return Results.Ok(locations.Select(ToResponse));
    }

    private static async Task<IResult> GetLocationByIdAsync(
        Guid id,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        var location = await service.GetLocationByIdAsync(id, cancellationToken);
        return location is null ? Results.NotFound() : Results.Ok(ToResponse(location));
    }

    private static async Task<IResult> CreateLocationAsync(
        CreateLocationRequest request,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var location = await service.CreateLocationAsync(
                new CreateLocationCommand(
                    request.WarehouseId,
                    request.ZoneId,
                    request.Code,
                    request.Name,
                    request.LocationType,
                    request.IsActive,
                    request.MapRow,
                    request.MapColumn),
                cancellationToken);

            return Results.Created($"/api/locations/{location.Id}", ToResponse(location));
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

    private static async Task<IResult> UpdateLocationAsync(
        Guid id,
        UpdateLocationRequest request,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var location = await service.UpdateLocationAsync(
                id,
                new UpdateLocationCommand(
                    request.WarehouseId,
                    request.ZoneId,
                    request.Code,
                    request.Name,
                    request.LocationType,
                    request.IsActive,
                    request.MapRow,
                    request.MapColumn),
                cancellationToken);

            return Results.Ok(ToResponse(location));
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

    private static async Task<IResult> BlockLocationAsync(
        Guid id,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        var blocked = await service.BlockLocationAsync(id, cancellationToken);
        return blocked ? Results.NoContent() : Results.NotFound();
    }

    private static async Task<IResult> UnblockLocationAsync(
        Guid id,
        WarehouseStructureService service,
        CancellationToken cancellationToken)
    {
        var unblocked = await service.UnblockLocationAsync(id, cancellationToken);
        return unblocked ? Results.NoContent() : Results.NotFound();
    }

    private static LocationResponse ToResponse(LocationDto location) =>
        new(
            location.Id,
            location.WarehouseId,
            location.WarehouseCode,
            location.ZoneId,
            location.ZoneCode,
            location.Code,
            location.Name,
            location.LocationType,
            location.IsActive,
            location.IsBlocked,
            location.MapRow,
            location.MapColumn);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message]
        });
}
