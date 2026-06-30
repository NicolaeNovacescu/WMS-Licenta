namespace Wms.Application.Putaway.Models;

public sealed record CreatePutawayTaskCommand(
    Guid ProductId,
    Guid SourceLocationId,
    Guid DestinationLocationId,
    Guid? ReceiptLineId,
    decimal Quantity,
    string? Notes);
