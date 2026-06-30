namespace Wms.Api.Contracts.Warehouses;

public sealed record CreateWarehouseRequest(
    string Code,
    string Name,
    bool IsActive);
