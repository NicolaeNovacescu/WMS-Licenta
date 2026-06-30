namespace Wms.Api.Contracts.Receipts;

public sealed record ReceiptResponse(
    Guid Id,
    Guid InboundOrderId,
    string InboundOrderStatus,
    Guid SupplierId,
    string SupplierCode,
    string SupplierName,
    string SupplierInvoiceReference,
    string Status,
    string? Notes,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? ConfirmedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<ReceiptLineResponse> Lines);

public sealed record ReceiptLineResponse(
    Guid Id,
    Guid InboundOrderLineId,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    Guid ReceivingLocationId,
    string ReceivingWarehouseCode,
    string ReceivingZoneCode,
    string ReceivingLocationCode,
    string ReceivingLocationName,
    decimal Quantity);
