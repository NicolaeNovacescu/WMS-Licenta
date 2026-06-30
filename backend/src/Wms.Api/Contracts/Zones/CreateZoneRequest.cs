namespace Wms.Api.Contracts.Zones;

public sealed record CreateZoneRequest(
    Guid WarehouseId,
    string Code,
    string Name,
    bool IsActive);
