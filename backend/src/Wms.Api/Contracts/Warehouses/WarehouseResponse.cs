namespace Wms.Api.Contracts.Warehouses;

public sealed record WarehouseResponse(
    Guid Id,
    string Code,
    string Name,
    bool IsActive);
