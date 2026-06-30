namespace Wms.Application.WarehouseStructure.Models;

public sealed record CreateLocationCommand(
    Guid WarehouseId,
    Guid ZoneId,
    string Code,
    string Name,
    string LocationType,
    bool IsActive,
    int MapRow,
    int MapColumn);
