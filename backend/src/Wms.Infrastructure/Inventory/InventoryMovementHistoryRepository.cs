using Microsoft.EntityFrameworkCore;
using Wms.Application.Inventory.Abstractions;
using Wms.Application.Inventory.Models;
using Wms.Domain.Inventory;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Inventory;

public sealed class InventoryMovementHistoryRepository(
    WmsDbContext dbContext) : IInventoryMovementHistoryRepository
{
    public async Task<IReadOnlyList<InventoryMovement>> ListMovementsAsync(
        InventoryMovementQuery query,
        CancellationToken cancellationToken)
    {
        var movements = dbContext.InventoryMovements
            .Include(movement => movement.Product)
            .Include(movement => movement.SourceLocation)
            .ThenInclude(location => location!.Warehouse)
            .Include(movement => movement.SourceLocation)
            .ThenInclude(location => location!.Zone)
            .Include(movement => movement.DestinationLocation)
            .ThenInclude(location => location!.Warehouse)
            .Include(movement => movement.DestinationLocation)
            .ThenInclude(location => location!.Zone)
            .Include(movement => movement.PerformedByUser)
            .AsQueryable();

        if (query.ProductId is Guid productId)
        {
            movements = movements.Where(movement => movement.ProductId == productId);
        }

        if (query.LocationId is Guid locationId)
        {
            movements = movements.Where(movement =>
                movement.SourceLocationId == locationId ||
                movement.DestinationLocationId == locationId);
        }

        if (!string.IsNullOrWhiteSpace(query.MovementType))
        {
            movements = movements.Where(movement =>
                movement.MovementType == query.MovementType);
        }

        return await movements
            .OrderByDescending(movement => movement.PerformedAtUtc)
            .ThenByDescending(movement => movement.Id)
            .ToArrayAsync(cancellationToken);
    }
}
