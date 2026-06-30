using Wms.Application.Inventory.Abstractions;
using Wms.Application.Inventory.Models;
using Wms.Domain.Inventory;

namespace Wms.Application.Inventory;

public sealed class InventoryVisibilityService(IInventoryVisibilityRepository repository)
{
    public async Task<IReadOnlyList<InventoryBalanceDto>> ListBalancesAsync(CancellationToken cancellationToken)
    {
        var balances = await repository.ListBalancesAsync(cancellationToken);
        return balances
            .Select(MapBalance)
            .ToArray();
    }

    public async Task<IReadOnlyList<InventoryByProductDto>> ListByProductAsync(CancellationToken cancellationToken)
    {
        var balances = await repository.ListBalancesAsync(cancellationToken);

        return balances
            .GroupBy(balance => new
            {
                balance.ProductId,
                balance.Product.Sku,
                balance.Product.Name,
            })
            .Select(group => new InventoryByProductDto(
                group.Key.ProductId,
                group.Key.Sku,
                group.Key.Name,
                group.Sum(balance => balance.OnHandQuantity),
                group.Sum(balance => balance.ReservedQuantity),
                group.Sum(balance => balance.PickedQuantity),
                group.Sum(balance => balance.AvailableQuantity),
                group.Max(balance => balance.UpdatedAtUtc)))
            .OrderBy(item => item.ProductName)
            .ToArray();
    }

    public async Task<IReadOnlyList<InventoryByLocationDto>> ListByLocationAsync(CancellationToken cancellationToken)
    {
        var balances = await repository.ListBalancesAsync(cancellationToken);

        return balances
            .GroupBy(balance => new
            {
                balance.LocationId,
                WarehouseCode = balance.Location.Warehouse.Code,
                ZoneCode = balance.Location.Zone.Code,
                LocationCode = balance.Location.Code,
                LocationName = balance.Location.Name,
                balance.Location.LocationType,
                LocationIsActive = balance.Location.IsActive,
                LocationIsBlocked = balance.Location.IsBlocked,
            })
            .Select(group => new InventoryByLocationDto(
                group.Key.LocationId,
                group.Key.WarehouseCode,
                group.Key.ZoneCode,
                group.Key.LocationCode,
                group.Key.LocationName,
                group.Key.LocationType,
                group.Key.LocationIsActive,
                group.Key.LocationIsBlocked,
                group.Sum(balance => balance.OnHandQuantity),
                group.Sum(balance => balance.ReservedQuantity),
                group.Sum(balance => balance.PickedQuantity),
                group.Sum(balance => balance.AvailableQuantity),
                group.Max(balance => balance.UpdatedAtUtc)))
            .OrderBy(item => item.WarehouseCode)
            .ThenBy(item => item.LocationCode)
            .ToArray();
    }

    private static InventoryBalanceDto MapBalance(InventoryBalance balance) =>
        new(
            balance.Id,
            balance.ProductId,
            balance.Product.Sku,
            balance.Product.Name,
            balance.LocationId,
            balance.Location.Warehouse.Code,
            balance.Location.Zone.Code,
            balance.Location.Code,
            balance.Location.Name,
            balance.Location.LocationType,
            balance.Location.IsActive,
            balance.Location.IsBlocked,
            balance.OnHandQuantity,
            balance.ReservedQuantity,
            balance.PickedQuantity,
            balance.AvailableQuantity,
            balance.UpdatedAtUtc);
}
