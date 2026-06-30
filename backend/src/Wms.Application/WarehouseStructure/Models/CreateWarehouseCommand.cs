namespace Wms.Application.WarehouseStructure.Models;

public sealed record CreateWarehouseCommand(
    string Code,
    string Name,
    bool IsActive);
