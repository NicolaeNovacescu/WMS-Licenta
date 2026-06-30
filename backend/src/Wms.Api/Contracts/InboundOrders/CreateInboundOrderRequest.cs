namespace Wms.Api.Contracts.InboundOrders;

public sealed record CreateInboundOrderRequest(
    Guid SupplierId,
    string SupplierInvoiceReference,
    string? Notes,
    IReadOnlyList<CreateInboundOrderLineRequest> Lines);

public sealed record CreateInboundOrderLineRequest(
    Guid ProductId,
    decimal ExpectedQuantity);
