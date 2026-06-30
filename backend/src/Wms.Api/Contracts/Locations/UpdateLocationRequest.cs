namespace Wms.Api.Contracts.Locations;

public sealed record UpdateLocationRequest(
    Guid WarehouseId,
    Guid ZoneId,
    string Code,
    string Name,
    string LocationType,
    bool IsActive,
    int MapRow,
    int MapColumn);
