namespace Wms.Application.InventoryCount.Models;

public sealed record CreateInventoryCountCommand(
    IReadOnlyCollection<CreateInventoryCountLineCommand>? Lines);
