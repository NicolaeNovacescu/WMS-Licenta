using Wms.Application.Inventory.Abstractions;
using Wms.Application.Inventory.Models;
using Wms.Domain.Inventory;

namespace Wms.Application.Inventory;

public sealed class InventoryMovementHistoryService(
    IInventoryMovementHistoryRepository repository)
{
    public async Task<IReadOnlyList<InventoryMovementDto>> ListMovementsAsync(
        Guid? productId,
        Guid? locationId,
        string? movementType,
        CancellationToken cancellationToken)
    {
        var query = new InventoryMovementQuery(
            productId,
            locationId,
            NormalizeMovementType(movementType));

        var movements = await repository.ListMovementsAsync(query, cancellationToken);

        return movements
            .Select(MapMovement)
            .ToArray();
    }

    private static InventoryMovementDto MapMovement(InventoryMovement movement) =>
        new(
            movement.Id,
            movement.ProductId,
            movement.Product.Sku,
            movement.Product.Name,
            movement.Quantity,
            movement.MovementType,
            movement.SourceLocationId,
            movement.SourceLocation?.Warehouse.Code,
            movement.SourceLocation?.Zone.Code,
            movement.SourceLocation?.Code,
            movement.SourceLocation?.Name,
            movement.DestinationLocationId,
            movement.DestinationLocation?.Warehouse.Code,
            movement.DestinationLocation?.Zone.Code,
            movement.DestinationLocation?.Code,
            movement.DestinationLocation?.Name,
            EmptyToNull(movement.ReferenceType),
            EmptyToNull(movement.ReferenceId),
            movement.PerformedAtUtc,
            movement.PerformedByUserId,
            movement.PerformedByUser?.UserName,
            EmptyToNull(movement.Notes));

    private static string? NormalizeMovementType(string? movementType)
    {
        if (string.IsNullOrWhiteSpace(movementType))
        {
            return null;
        }

        var normalized = InventoryMovementType.Normalize(movementType);

        if (!InventoryMovementType.All.Contains(normalized, StringComparer.Ordinal))
        {
            throw new ArgumentException(
                $"Movement type '{movementType}' is not supported.",
                nameof(movementType));
        }

        return normalized;
    }

    private static string? EmptyToNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;
}
