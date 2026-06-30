using Wms.Application.Inventory.Models;
using Wms.Domain.Inventory;

namespace Wms.Application.Inventory.Abstractions;

public interface IInventoryMovementHistoryRepository
{
    Task<IReadOnlyList<InventoryMovement>> ListMovementsAsync(
        InventoryMovementQuery query,
        CancellationToken cancellationToken);
}
