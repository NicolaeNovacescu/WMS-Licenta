namespace Wms.Application.Replenishment.Models;

public sealed record CreateReplenishmentRuleCommand(
    Guid ProductId,
    Guid TargetLocationId,
    decimal MinimumThreshold,
    decimal TargetQuantity);
