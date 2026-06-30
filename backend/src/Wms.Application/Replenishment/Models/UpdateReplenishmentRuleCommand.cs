namespace Wms.Application.Replenishment.Models;

public sealed record UpdateReplenishmentRuleCommand(
    Guid ProductId,
    Guid TargetLocationId,
    decimal MinimumThreshold,
    decimal TargetQuantity);
