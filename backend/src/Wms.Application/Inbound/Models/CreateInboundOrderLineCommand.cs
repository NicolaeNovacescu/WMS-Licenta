namespace Wms.Application.Inbound.Models;

public sealed record CreateInboundOrderLineCommand(
    Guid ProductId,
    decimal ExpectedQuantity);
