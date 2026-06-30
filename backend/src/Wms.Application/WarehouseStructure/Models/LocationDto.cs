namespace Wms.Application.WarehouseStructure.Models;

public sealed record LocationDto(
    Guid Id,
    Guid WarehouseId,
    string WarehouseCode,
    Guid ZoneId,
    string ZoneCode,
    string Code,
    string Name,
    string LocationType,
    bool IsActive,
    bool IsBlocked,
    int MapRow,
    int MapColumn);
