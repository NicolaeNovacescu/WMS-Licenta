namespace Wms.Application.InventoryCount.Models;

public sealed record CompleteInventoryCountCommand(
    IReadOnlyCollection<CompleteInventoryCountLineCommand>? Lines);
