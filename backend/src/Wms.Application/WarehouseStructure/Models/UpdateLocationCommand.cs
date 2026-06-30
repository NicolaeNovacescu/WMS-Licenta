namespace Wms.Application.WarehouseStructure.Models;

public sealed record UpdateLocationCommand(
    Guid WarehouseId,
    Guid ZoneId,
    string Code,
    string Name,
    string LocationType,
    bool IsActive,
    int MapRow,
    int MapColumn);
