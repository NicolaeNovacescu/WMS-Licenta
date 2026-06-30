namespace Wms.Application.Inbound.Models;

public sealed record ReceiptDto(
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
    IReadOnlyList<ReceiptLineDto> Lines);
