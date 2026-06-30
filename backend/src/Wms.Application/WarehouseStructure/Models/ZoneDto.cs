namespace Wms.Application.WarehouseStructure.Models;

public sealed record ZoneDto(
    Guid Id,
    Guid WarehouseId,
    string WarehouseCode,
    string Code,
    string Name,
    bool IsActive);
