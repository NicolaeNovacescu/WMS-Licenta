namespace Wms.Api.Contracts.Inventory;

public sealed record InventoryByLocationResponse(
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
