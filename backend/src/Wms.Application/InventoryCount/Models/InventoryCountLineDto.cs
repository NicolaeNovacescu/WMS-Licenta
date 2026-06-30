namespace Wms.Application.InventoryCount.Models;

public sealed record InventoryCountLineDto(
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
