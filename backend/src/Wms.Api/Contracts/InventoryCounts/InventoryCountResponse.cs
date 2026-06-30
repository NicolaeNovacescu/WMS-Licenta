namespace Wms.Api.Contracts.InventoryCounts;

public sealed record InventoryCountResponse(
    Guid Id,
    string Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<InventoryCountLineResponse> Lines);

public sealed record InventoryCountLineResponse(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    Guid LocationId,
    string WarehouseCode,
    string ZoneCode,
    string LocationCode,
    string LocationName,
    string LocationType,
    bool LocationIsActive,
    bool LocationIsBlocked,
    Guid? InventoryBalanceId,
    decimal ExpectedSystemQuantity,
    decimal? CountedQuantity,
    decimal? VarianceQuantity);
