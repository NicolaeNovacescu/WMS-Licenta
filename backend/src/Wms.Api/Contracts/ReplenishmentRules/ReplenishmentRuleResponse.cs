namespace Wms.Api.Contracts.ReplenishmentRules;

public sealed record ReplenishmentRuleResponse(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    Guid TargetLocationId,
    string TargetWarehouseCode,
    string TargetZoneCode,
    string TargetLocationCode,
    string TargetLocationName,
    string TargetLocationType,
    bool TargetLocationIsActive,
    bool TargetLocationIsBlocked,
    decimal MinimumThreshold,
    decimal TargetQuantity,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);
