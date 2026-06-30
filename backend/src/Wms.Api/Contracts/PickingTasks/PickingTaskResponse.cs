namespace Wms.Api.Contracts.PickingTasks;

public sealed record PickingTaskResponse(
    Guid Id,
    Guid SalesOrderId,
    string SalesOrderStatus,
    string Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<PickingTaskLineResponse> Lines);

public sealed record PickingTaskLineResponse(
    Guid Id,
    Guid SalesOrderLineId,
    Guid SalesOrderReservationId,
    Guid InventoryBalanceId,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    Guid SourceLocationId,
    string SourceWarehouseCode,
    string SourceZoneCode,
    string SourceLocationCode,
    string SourceLocationName,
    string SourceLocationType,
    bool SourceLocationIsActive,
    bool SourceLocationIsBlocked,
    decimal QuantityToPick,
    decimal PickedQuantity);
