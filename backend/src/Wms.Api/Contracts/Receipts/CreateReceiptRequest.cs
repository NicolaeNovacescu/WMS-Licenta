namespace Wms.Api.Contracts.Receipts;

public sealed record CreateReceiptRequest(
    Guid InboundOrderId,
    string? Notes,
    IReadOnlyList<CreateReceiptLineRequest> Lines);

public sealed record CreateReceiptLineRequest(
    Guid InboundOrderLineId,
    Guid ReceivingLocationId,
    decimal Quantity);
