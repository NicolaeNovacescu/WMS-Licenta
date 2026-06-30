namespace Wms.Application.WarehouseStructure.Models;

public sealed record CreateZoneCommand(
    Guid WarehouseId,
    string Code,
    string Name,
    bool IsActive);
