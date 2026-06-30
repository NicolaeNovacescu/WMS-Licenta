namespace Wms.Api.Contracts.TransferTasks;

public sealed record CreateTransferTaskRequest(
    Guid ProductId,
    Guid SourceLocationId,
    Guid DestinationLocationId,
    decimal Quantity,
    string? Reason);
