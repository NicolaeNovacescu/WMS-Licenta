namespace Wms.Application.Sales.Models;

public sealed record SalesOrderReservationDto(
    Guid Id,
    Guid InventoryBalanceId,
    Guid LocationId,
    string WarehouseCode,
    string ZoneCode,
    string LocationCode,
    string LocationName,
    string LocationType,
    bool LocationIsActive,
    bool LocationIsBlocked,
    decimal Quantity,
    decimal PickedQuantity);
