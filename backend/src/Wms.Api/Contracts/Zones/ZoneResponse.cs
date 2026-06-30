namespace Wms.Api.Contracts.Zones;

public sealed record ZoneResponse(
    Guid Id,
    Guid WarehouseId,
    string WarehouseCode,
    string Code,
    string Name,
    bool IsActive);
