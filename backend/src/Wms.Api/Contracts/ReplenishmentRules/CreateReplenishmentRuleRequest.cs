namespace Wms.Api.Contracts.ReplenishmentRules;

public sealed record CreateReplenishmentRuleRequest(
    Guid ProductId,
    Guid TargetLocationId,
    decimal MinimumThreshold,
    decimal TargetQuantity);
