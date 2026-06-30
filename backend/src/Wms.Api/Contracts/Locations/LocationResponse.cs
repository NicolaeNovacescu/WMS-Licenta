namespace Wms.Api.Contracts.Locations;

public sealed record LocationResponse(
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
