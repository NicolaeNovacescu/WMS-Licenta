namespace Wms.Application.Transfer.Models;

public sealed record CreateTransferTaskCommand(
    Guid ProductId,
    Guid SourceLocationId,
    Guid DestinationLocationId,
    decimal Quantity,
    string? Reason);
