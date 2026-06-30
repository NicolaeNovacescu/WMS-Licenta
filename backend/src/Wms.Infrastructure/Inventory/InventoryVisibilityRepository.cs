using Microsoft.EntityFrameworkCore;
using Wms.Application.Inventory.Abstractions;
using Wms.Domain.Inventory;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Inventory;

public sealed class InventoryVisibilityRepository(WmsDbContext dbContext) : IInventoryVisibilityRepository
{
    public async Task<IReadOnlyList<InventoryBalance>> ListBalancesAsync(CancellationToken cancellationToken) =>
        await dbContext.InventoryBalances
            .Include(balance => balance.Product)
            .Include(balance => balance.Location)
            .ThenInclude(location => location.Warehouse)
            .Include(balance => balance.Location)
            .ThenInclude(location => location.Zone)
            .OrderBy(balance => balance.Product.Name)
            .ThenBy(balance => balance.Location.Warehouse.Code)
            .ThenBy(balance => balance.Location.Code)
            .ToArrayAsync(cancellationToken);
}
