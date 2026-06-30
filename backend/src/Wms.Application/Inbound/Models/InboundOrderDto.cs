namespace Wms.Application.Inbound.Models;

public sealed record InboundOrderDto(
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
    IReadOnlyList<InboundOrderLineDto> Lines);
