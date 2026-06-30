namespace Wms.Application.Replenishment.Models;

public sealed record CreateReplenishmentTaskCommand(
    Guid ProductId,
    Guid SourceLocationId,
    Guid TargetLocationId,
    decimal Quantity);
