namespace Wms.Api.Contracts.InboundOrders;

public sealed record InboundOrderResponse(
    Guid Id,
    Guid SupplierId,
    string SupplierCode,
    string SupplierName,
    string SupplierInvoiceReference,
    string Status,
    string? Notes,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<InboundOrderLineResponse> Lines);

public sealed record InboundOrderLineResponse(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    decimal ExpectedQuantity,
    decimal ReceivedQuantity);
