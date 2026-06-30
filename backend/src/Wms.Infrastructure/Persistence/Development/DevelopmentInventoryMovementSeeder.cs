using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Domain.Authentication;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentInventoryMovementSeeder
{
    private static readonly InventoryMovementSeed[] InventoryMovements =
    [
        new(
            new Guid("7a874b50-87ce-4df8-bcad-f0150d7d49d1"),
            "FG-1000",
            8m,
            InventoryMovementType.Addition,
            null,
            null,
            "MAIN",
            "STAGE-B-01",
            "DEMO",
            "seed-movement-001",
            new DateTimeOffset(2026, 3, 14, 8, 15, 0, TimeSpan.Zero),
            "admin.demo",
            "Illustrative staging addition for demo history."),
        new(
            new Guid("f1496201-174a-4c3d-a2bd-ad6dcd0d8712"),
            "FG-1000",
            4m,
            InventoryMovementType.Relocation,
            "MAIN",
            "STAGE-B-01",
            "MAIN",
            "PICK-A-01",
            "DEMO",
            "seed-movement-002",
            new DateTimeOffset(2026, 3, 14, 8, 50, 0, TimeSpan.Zero),
            "warehouse.demo",
            "Illustrative relocation toward picking."),
        new(
            new Guid("3421f5b2-6d43-4d9c-846e-588ba60c6ce3"),
            "RM-2000",
            40m,
            InventoryMovementType.Addition,
            null,
            null,
            "MAIN",
            "REC-A-01",
            "DEMO",
            "seed-movement-003",
            new DateTimeOffset(2026, 3, 14, 7, 55, 0, TimeSpan.Zero),
            null,
            "Illustrative receiving-side addition without a linked performer."),
        new(
            new Guid("71aa3389-bf5a-44e8-a379-f9e247b9c6eb"),
            "RM-2000",
            12m,
            InventoryMovementType.Relocation,
            "MAIN",
            "REC-A-01",
            "MAIN",
            "PICK-A-01",
            "DEMO",
            "seed-movement-004",
            new DateTimeOffset(2026, 3, 14, 9, 5, 0, TimeSpan.Zero),
            "warehouse.demo",
            "Illustrative relocation from receiving toward picking."),
        new(
            new Guid("8175c70e-6f38-4f07-bcb0-2eb0f7e53bf0"),
            "FG-1000",
            2m,
            InventoryMovementType.Removal,
            "MAIN",
            "PICK-A-01",
            null,
            null,
            "DEMO",
            "seed-movement-005",
            new DateTimeOffset(2026, 3, 14, 9, 40, 0, TimeSpan.Zero),
            "admin.demo",
            "Illustrative removal to show one-sided outbound history."),
    ];

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var productsBySku = await dbContext.Products
            .ToDictionaryAsync(product => product.Sku, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var locationsByWarehouseAndCode = await dbContext.Locations
            .Include(location => location.Warehouse)
            .ToDictionaryAsync(
                location => ComposeKey(location.Warehouse.Code, location.Code),
                StringComparer.OrdinalIgnoreCase,
                cancellationToken);

        var usersByUserName = await dbContext.Users
            .ToDictionaryAsync(user => user.UserName, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var existingMovements = await dbContext.InventoryMovements
            .ToDictionaryAsync(movement => movement.Id, cancellationToken);

        foreach (var definition in InventoryMovements)
        {
            if (!productsBySku.TryGetValue(definition.ProductSku, out var product))
            {
                throw new InvalidOperationException(
                    $"Development movement seed could not find product '{definition.ProductSku}'.");
            }

            var sourceLocation = ResolveLocation(
                definition.SourceWarehouseCode,
                definition.SourceLocationCode,
                locationsByWarehouseAndCode);

            var destinationLocation = ResolveLocation(
                definition.DestinationWarehouseCode,
                definition.DestinationLocationCode,
                locationsByWarehouseAndCode);

            var performedByUser = ResolveUser(definition.PerformedByUserName, usersByUserName);

            if (!existingMovements.TryGetValue(definition.Id, out var movement))
            {
                movement = new InventoryMovement
                {
                    Id = definition.Id,
                };

                dbContext.InventoryMovements.Add(movement);
                existingMovements[definition.Id] = movement;
            }

            movement.ProductId = product.Id;
            movement.Product = product;
            movement.Quantity = definition.Quantity;
            movement.MovementType = definition.MovementType;
            movement.SourceLocationId = sourceLocation?.Id;
            movement.SourceLocation = sourceLocation;
            movement.DestinationLocationId = destinationLocation?.Id;
            movement.DestinationLocation = destinationLocation;
            movement.ReferenceType = definition.ReferenceType;
            movement.ReferenceId = definition.ReferenceId;
            movement.PerformedAtUtc = definition.PerformedAtUtc;
            movement.PerformedByUserId = performedByUser?.Id;
            movement.PerformedByUser = performedByUser;
            movement.Notes = definition.Notes;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development inventory movement seed ensured {MovementCount} inventory movements.",
            InventoryMovements.Length);
    }

    private static Location? ResolveLocation(
        string? warehouseCode,
        string? locationCode,
        IReadOnlyDictionary<string, Location> locationsByWarehouseAndCode)
    {
        if (string.IsNullOrWhiteSpace(warehouseCode) || string.IsNullOrWhiteSpace(locationCode))
        {
            return null;
        }

        if (!locationsByWarehouseAndCode.TryGetValue(
                ComposeKey(warehouseCode, locationCode),
                out var location))
        {
            throw new InvalidOperationException(
                $"Development movement seed could not find location '{warehouseCode}/{locationCode}'.");
        }

        return location;
    }

    private static User? ResolveUser(
        string? userName,
        IReadOnlyDictionary<string, User> usersByUserName)
    {
        if (string.IsNullOrWhiteSpace(userName))
        {
            return null;
        }

        if (!usersByUserName.TryGetValue(userName, out var user))
        {
            throw new InvalidOperationException(
                $"Development movement seed could not find user '{userName}'.");
        }

        return user;
    }

    private static string ComposeKey(string left, string right) => $"{left}::{right}";

    private sealed record InventoryMovementSeed(
        Guid Id,
        string ProductSku,
        decimal Quantity,
        string MovementType,
        string? SourceWarehouseCode,
        string? SourceLocationCode,
        string? DestinationWarehouseCode,
        string? DestinationLocationCode,
        string? ReferenceType,
        string? ReferenceId,
        DateTimeOffset PerformedAtUtc,
        string? PerformedByUserName,
        string? Notes);
}
