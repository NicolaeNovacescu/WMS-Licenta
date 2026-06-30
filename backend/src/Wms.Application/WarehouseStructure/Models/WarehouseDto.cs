namespace Wms.Application.WarehouseStructure.Models;

public sealed record WarehouseDto(
    Guid Id,
    string Code,
    string Name,
    bool IsActive);
