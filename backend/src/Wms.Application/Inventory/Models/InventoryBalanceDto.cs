namespace Wms.Application.Inventory.Models;

public sealed record InventoryBalanceDto(
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
    decimal OnHandQuantity,
    decimal ReservedQuantity,
    decimal PickedQuantity,
    decimal AvailableQuantity,
    DateTimeOffset UpdatedAtUtc);
