namespace Wms.Api.Contracts.InboundOrders;

public sealed record UpdateInboundOrderRequest(
    Guid SupplierId,
    string SupplierInvoiceReference,
    string? Notes,
    IReadOnlyList<CreateInboundOrderLineRequest> Lines);
