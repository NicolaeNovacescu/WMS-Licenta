using System.Security.Claims;
using Wms.Api.Contracts.InboundOrders;
using Wms.Api.Contracts.Receipts;
using Wms.Application.Inbound;
using Wms.Application.Inbound.Models;

namespace Wms.Api.Endpoints;

public static class InboundEndpoints
{
    private static readonly string[] InboundOrderReadRoles = ["Admin", "Warehouse"];

    public static IEndpointRouteBuilder MapInboundEndpoints(this IEndpointRouteBuilder app)
    {
        var inboundOrdersGroup = app.MapGroup("/api/inbound-orders");
        inboundOrdersGroup.MapGet(string.Empty, GetInboundOrdersAsync)
            .RequireAuthorization(policy => policy.RequireRole(InboundOrderReadRoles));
        inboundOrdersGroup.MapGet("/{id:guid}", GetInboundOrderByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(InboundOrderReadRoles));
        inboundOrdersGroup.MapPost(string.Empty, CreateInboundOrderAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        inboundOrdersGroup.MapPut("/{id:guid}", UpdateInboundOrderAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        inboundOrdersGroup.MapPatch("/{id:guid}/mark-ready", MarkInboundOrderReadyAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        inboundOrdersGroup.MapPatch("/{id:guid}/cancel", CancelInboundOrderAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        var receiptsGroup = app.MapGroup("/api/receipts")
            .RequireAuthorization(policy => policy.RequireRole("Warehouse"));

        receiptsGroup.MapGet(string.Empty, GetReceiptsAsync);
        receiptsGroup.MapGet("/{id:guid}", GetReceiptByIdAsync);
        receiptsGroup.MapPost(string.Empty, CreateReceiptAsync);
        receiptsGroup.MapPatch("/{id:guid}/start", StartReceiptAsync);
        receiptsGroup.MapPatch("/{id:guid}/confirm", ConfirmReceiptAsync);
        receiptsGroup.MapPatch("/{id:guid}/cancel", CancelReceiptAsync);

        return app;
    }

    private static async Task<IResult> GetInboundOrdersAsync(
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        var inboundOrders = await service.ListInboundOrdersAsync(cancellationToken);
        return Results.Ok(inboundOrders.Select(ToResponse));
    }

    private static async Task<IResult> GetInboundOrderByIdAsync(
        Guid id,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        var inboundOrder = await service.GetInboundOrderByIdAsync(id, cancellationToken);
        return inboundOrder is null ? Results.NotFound() : Results.Ok(ToResponse(inboundOrder));
    }

    private static async Task<IResult> CreateInboundOrderAsync(
        CreateInboundOrderRequest request,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var inboundOrder = await service.CreateInboundOrderAsync(
                new CreateInboundOrderCommand(
                    request.SupplierId,
                    request.SupplierInvoiceReference,
                    request.Notes,
                    (request.Lines ?? []).Select(line => new CreateInboundOrderLineCommand(
                        line.ProductId,
                        line.ExpectedQuantity)).ToArray()),
                cancellationToken);

            return Results.Created($"/api/inbound-orders/{inboundOrder.Id}", ToResponse(inboundOrder));
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

    private static async Task<IResult> UpdateInboundOrderAsync(
        Guid id,
        UpdateInboundOrderRequest request,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var inboundOrder = await service.UpdateInboundOrderAsync(
                id,
                new UpdateInboundOrderCommand(
                    request.SupplierId,
                    request.SupplierInvoiceReference,
                    request.Notes,
                    (request.Lines ?? []).Select(line => new CreateInboundOrderLineCommand(
                        line.ProductId,
                        line.ExpectedQuantity)).ToArray()),
                cancellationToken);

            return Results.Ok(ToResponse(inboundOrder));
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

    private static async Task<IResult> MarkInboundOrderReadyAsync(
        Guid id,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var inboundOrder = await service.MarkInboundOrderReadyAsync(id, cancellationToken);
            return Results.Ok(ToResponse(inboundOrder));
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

    private static async Task<IResult> CancelInboundOrderAsync(
        Guid id,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var inboundOrder = await service.CancelInboundOrderAsync(id, cancellationToken);
            return Results.Ok(ToResponse(inboundOrder));
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

    private static async Task<IResult> GetReceiptsAsync(
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        var receipts = await service.ListReceiptsAsync(cancellationToken);
        return Results.Ok(receipts.Select(ToResponse));
    }

    private static async Task<IResult> GetReceiptByIdAsync(
        Guid id,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        var receipt = await service.GetReceiptByIdAsync(id, cancellationToken);
        return receipt is null ? Results.NotFound() : Results.Ok(ToResponse(receipt));
    }

    private static async Task<IResult> CreateReceiptAsync(
        CreateReceiptRequest request,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var receipt = await service.CreateReceiptAsync(
                new CreateReceiptCommand(
                    request.InboundOrderId,
                    request.Notes,
                    (request.Lines ?? []).Select(line => new CreateReceiptLineCommand(
                        line.InboundOrderLineId,
                        line.ReceivingLocationId,
                        line.Quantity)).ToArray()),
                cancellationToken);

            return Results.Created($"/api/receipts/{receipt.Id}", ToResponse(receipt));
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

    private static async Task<IResult> StartReceiptAsync(
        Guid id,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var receipt = await service.StartReceiptAsync(id, cancellationToken);
            return Results.Ok(ToResponse(receipt));
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

    private static async Task<IResult> ConfirmReceiptAsync(
        Guid id,
        ClaimsPrincipal user,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(user, out var currentUserId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var receipt = await service.ConfirmReceiptAsync(id, currentUserId, cancellationToken);
            return Results.Ok(ToResponse(receipt));
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

    private static async Task<IResult> CancelReceiptAsync(
        Guid id,
        InboundWorkflowService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var receipt = await service.CancelReceiptAsync(id, cancellationToken);
            return Results.Ok(ToResponse(receipt));
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

    private static InboundOrderResponse ToResponse(InboundOrderDto inboundOrder) =>
        new(
            inboundOrder.Id,
            inboundOrder.SupplierId,
            inboundOrder.SupplierCode,
            inboundOrder.SupplierName,
            inboundOrder.SupplierInvoiceReference,
            inboundOrder.Status,
            inboundOrder.Notes,
            inboundOrder.CreatedAtUtc,
            inboundOrder.UpdatedAtUtc,
            inboundOrder.CancelledAtUtc,
            inboundOrder.Lines.Select(line => new InboundOrderLineResponse(
                line.Id,
                line.ProductId,
                line.ProductSku,
                line.ProductName,
                line.ExpectedQuantity,
                line.ReceivedQuantity)).ToArray());

    private static ReceiptResponse ToResponse(ReceiptDto receipt) =>
        new(
            receipt.Id,
            receipt.InboundOrderId,
            receipt.InboundOrderStatus,
            receipt.SupplierId,
            receipt.SupplierCode,
            receipt.SupplierName,
            receipt.SupplierInvoiceReference,
            receipt.Status,
            receipt.Notes,
            receipt.CreatedAtUtc,
            receipt.StartedAtUtc,
            receipt.ConfirmedAtUtc,
            receipt.CancelledAtUtc,
            receipt.Lines.Select(line => new ReceiptLineResponse(
                line.Id,
                line.InboundOrderLineId,
                line.ProductId,
                line.ProductSku,
                line.ProductName,
                line.ReceivingLocationId,
                line.ReceivingWarehouseCode,
                line.ReceivingZoneCode,
                line.ReceivingLocationCode,
                line.ReceivingLocationName,
                line.Quantity)).ToArray());

    private static bool TryGetCurrentUserId(ClaimsPrincipal user, out Guid currentUserId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out currentUserId);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
