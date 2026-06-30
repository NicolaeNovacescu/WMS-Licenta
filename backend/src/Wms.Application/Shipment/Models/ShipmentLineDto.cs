namespace Wms.Application.Shipment.Models;

public sealed record ShipmentLineDto(
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
