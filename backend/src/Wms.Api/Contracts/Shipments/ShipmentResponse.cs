namespace Wms.Api.Contracts.Shipments;

public sealed record ShipmentResponse(
    Guid Id,
    Guid SalesOrderId,
    string SalesOrderStatus,
    string Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<ShipmentLineResponse> Lines);

public sealed record ShipmentLineResponse(
    Guid Id,
    Guid PickingTaskLineId,
    Guid PickingTaskId,
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
    decimal QuantityToShip,
    decimal ShippedQuantity);
