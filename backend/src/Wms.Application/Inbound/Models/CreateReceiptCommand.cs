namespace Wms.Application.Inbound.Models;

public sealed record CreateReceiptCommand(
    Guid InboundOrderId,
    string? Notes,
    IReadOnlyCollection<CreateReceiptLineCommand> Lines);
