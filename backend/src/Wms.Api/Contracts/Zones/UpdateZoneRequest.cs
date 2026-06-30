namespace Wms.Api.Contracts.Zones;

public sealed record UpdateZoneRequest(
    Guid WarehouseId,
    string Code,
    string Name,
    bool IsActive);
