namespace Wms.Application.WarehouseStructure.Models;

public sealed record UpdateWarehouseCommand(
    string Code,
    string Name,
    bool IsActive);
