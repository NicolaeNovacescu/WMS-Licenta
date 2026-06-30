namespace Wms.Api.Contracts.InventoryCounts;

public sealed record CreateInventoryCountRequest(
    IReadOnlyList<CreateInventoryCountLineRequest>? Lines);

public sealed record CreateInventoryCountLineRequest(
    Guid ProductId,
    Guid LocationId);
