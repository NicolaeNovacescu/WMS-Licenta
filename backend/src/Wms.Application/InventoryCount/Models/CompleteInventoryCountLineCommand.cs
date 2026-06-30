namespace Wms.Application.InventoryCount.Models;

public sealed record CompleteInventoryCountLineCommand(
    Guid InventoryCountLineId,
    decimal CountedQuantity);
