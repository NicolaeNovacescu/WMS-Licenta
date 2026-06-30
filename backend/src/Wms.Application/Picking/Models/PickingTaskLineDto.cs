namespace Wms.Application.Picking.Models;

public sealed record PickingTaskLineDto(
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
