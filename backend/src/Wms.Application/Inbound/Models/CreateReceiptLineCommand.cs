namespace Wms.Application.Inbound.Models;

public sealed record CreateReceiptLineCommand(
    Guid InboundOrderLineId,
    Guid ReceivingLocationId,
    decimal Quantity);
