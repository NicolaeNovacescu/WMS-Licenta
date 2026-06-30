namespace Wms.Api.Contracts.InventoryCounts;

public sealed record CompleteInventoryCountRequest(
    IReadOnlyList<CompleteInventoryCountLineRequest>? Lines);

public sealed record CompleteInventoryCountLineRequest(
    Guid InventoryCountLineId,
    decimal CountedQuantity);
