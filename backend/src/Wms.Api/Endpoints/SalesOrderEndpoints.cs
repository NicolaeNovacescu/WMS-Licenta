using Wms.Api.Contracts.SalesOrders;
using Wms.Application.Sales;
using Wms.Application.Sales.Models;

namespace Wms.Api.Endpoints;

public static class SalesOrderEndpoints
{
    private static readonly string[] SalesOrderReadRoles = ["Sales", "Admin", "Warehouse"];
    private static readonly string[] SalesOrderWriteRoles = ["Sales", "Admin"];

    public static IEndpointRouteBuilder MapSalesOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var salesOrdersGroup = app.MapGroup("/api/sales-orders");

        salesOrdersGroup.MapGet(string.Empty, GetSalesOrdersAsync)
            .RequireAuthorization(policy => policy.RequireRole(SalesOrderReadRoles));
        salesOrdersGroup.MapGet("/{id:guid}", GetSalesOrderByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(SalesOrderReadRoles));
        salesOrdersGroup.MapPost(string.Empty, CreateSalesOrderAsync)
            .RequireAuthorization(policy => policy.RequireRole(SalesOrderWriteRoles));
        salesOrdersGroup.MapPut("/{id:guid}", UpdateSalesOrderAsync)
            .RequireAuthorization(policy => policy.RequireRole(SalesOrderWriteRoles));
        salesOrdersGroup.MapPatch("/{id:guid}/confirm", ConfirmSalesOrderAsync)
            .RequireAuthorization(policy => policy.RequireRole("Sales"));
        salesOrdersGroup.MapPatch("/{id:guid}/cancel", CancelSalesOrderAsync)
            .RequireAuthorization(policy => policy.RequireRole(SalesOrderWriteRoles));

        return app;
    }

    private static async Task<IResult> GetSalesOrdersAsync(
        SalesOrderWorkflowService service,
        CancellationToken cancellationToken)
    {
        var salesOrders = await service.ListSalesOrdersAsync(cancellationToken);
        return Results.Ok(salesOrders.Select(ToResponse));
    }

    private static async Task<IResult> GetSalesOrderByIdAsync(
        Guid id,
        SalesOrderWorkflowService service,
        CancellationToken cancellationToken)
    {
        var salesOrder = await service.GetSalesOrderByIdAsync(id, cancellationToken);
        return salesOrder is null ? Results.NotFound() : Results.Ok(ToResponse(salesOrder));
    }

    private static async Task<IResult> CreateSalesOrderAsync(
        CreateSalesOrderRequest request,
        SalesOrderWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var salesOrder = await service.CreateSalesOrderAsync(
                new CreateSalesOrderCommand(
                    request.CustomerId,
                    request.Lines?
                        .Select(line => new CreateSalesOrderLineCommand(line.ProductId, line.OrderedQuantity))
                        .ToArray() ?? []),
                cancellationToken);

            return Results.Created($"/api/sales-orders/{salesOrder.Id}", ToResponse(salesOrder));
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

    private static async Task<IResult> UpdateSalesOrderAsync(
        Guid id,
        UpdateSalesOrderRequest request,
        SalesOrderWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var salesOrder = await service.UpdateSalesOrderAsync(
                id,
                new UpdateSalesOrderCommand(
                    request.CustomerId,
                    request.Lines?
                        .Select(line => new CreateSalesOrderLineCommand(line.ProductId, line.OrderedQuantity))
                        .ToArray() ?? []),
                cancellationToken);

            return Results.Ok(ToResponse(salesOrder));
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

    private static async Task<IResult> ConfirmSalesOrderAsync(
        Guid id,
        SalesOrderWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var salesOrder = await service.ConfirmSalesOrderAsync(id, cancellationToken);
            return Results.Ok(ToResponse(salesOrder));
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

    private static async Task<IResult> CancelSalesOrderAsync(
        Guid id,
        SalesOrderWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var salesOrder = await service.CancelSalesOrderAsync(id, cancellationToken);
            return Results.Ok(ToResponse(salesOrder));
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

    private static SalesOrderResponse ToResponse(SalesOrderDto salesOrder) =>
        new(
            salesOrder.Id,
            salesOrder.CustomerId,
            salesOrder.CustomerCode,
            salesOrder.CustomerName,
            salesOrder.CustomerIsActive,
            salesOrder.Status,
            salesOrder.CreatedAtUtc,
            salesOrder.UpdatedAtUtc,
            salesOrder.ConfirmedAtUtc,
            salesOrder.CancelledAtUtc,
            salesOrder.Lines
                .Select(line => new SalesOrderLineResponse(
                    line.Id,
                    line.ProductId,
                    line.ProductSku,
                    line.ProductName,
                    line.OrderedQuantity,
                    line.ReservedQuantity,
                    line.PickedQuantity,
                    line.Reservations
                        .Select(reservation => new SalesOrderReservationResponse(
                            reservation.Id,
                            reservation.InventoryBalanceId,
                            reservation.LocationId,
                            reservation.WarehouseCode,
                            reservation.ZoneCode,
                            reservation.LocationCode,
                            reservation.LocationName,
                            reservation.LocationType,
                            reservation.LocationIsActive,
                            reservation.LocationIsBlocked,
                            reservation.Quantity,
                            reservation.PickedQuantity))
                        .ToArray()))
                .ToArray());

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
