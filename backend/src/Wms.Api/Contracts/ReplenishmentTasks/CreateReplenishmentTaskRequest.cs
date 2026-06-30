namespace Wms.Api.Contracts.ReplenishmentTasks;

public sealed record CreateReplenishmentTaskRequest(
    Guid ProductId,
    Guid SourceLocationId,
    Guid TargetLocationId,
    decimal Quantity);
