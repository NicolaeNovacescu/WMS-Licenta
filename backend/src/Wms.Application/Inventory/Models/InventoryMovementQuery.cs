namespace Wms.Application.Inventory.Models;

public sealed record InventoryMovementQuery(
    Guid? ProductId,
    Guid? LocationId,
    string? MovementType);
