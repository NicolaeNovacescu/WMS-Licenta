namespace Wms.Application.InventoryCount.Models;

public sealed record CreateInventoryCountLineCommand(
    Guid ProductId,
    Guid LocationId);
