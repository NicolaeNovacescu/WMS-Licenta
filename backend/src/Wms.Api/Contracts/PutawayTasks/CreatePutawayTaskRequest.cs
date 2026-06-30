namespace Wms.Api.Contracts.PutawayTasks;

public sealed record CreatePutawayTaskRequest(
    Guid ProductId,
    Guid SourceLocationId,
    Guid DestinationLocationId,
    Guid? ReceiptLineId,
    decimal Quantity,
    string? Notes);
