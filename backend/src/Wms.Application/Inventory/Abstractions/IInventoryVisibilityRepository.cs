using Wms.Domain.Inventory;

namespace Wms.Application.Inventory.Abstractions;

public interface IInventoryVisibilityRepository
{
    Task<IReadOnlyList<InventoryBalance>> ListBalancesAsync(CancellationToken cancellationToken);
}
