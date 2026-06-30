namespace Wms.Api.Contracts.Warehouses;

public sealed record UpdateWarehouseRequest(
    string Code,
    string Name,
    bool IsActive);
