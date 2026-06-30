namespace Wms.Application.WarehouseStructure.Models;

public sealed record UpdateZoneCommand(
    Guid WarehouseId,
    string Code,
    string Name,
    bool IsActive);
