namespace Wms.Api.Contracts.ReplenishmentRules;

public sealed record UpdateReplenishmentRuleRequest(
    Guid ProductId,
    Guid TargetLocationId,
    decimal MinimumThreshold,
    decimal TargetQuantity);
