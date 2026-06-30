using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Replenishment.Abstractions;
using Wms.Application.Replenishment.Models;
using Wms.Domain.Inventory;
using Wms.Domain.Replenishment;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Replenishment;

public sealed class ReplenishmentWorkflowService(IReplenishmentWorkflowRepository repository, IAuditLogWriter? auditLogWriter = null)
{
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<ReplenishmentRuleDto>> ListReplenishmentRulesAsync(CancellationToken cancellationToken)
    {
        var replenishmentRules = await repository.ListReplenishmentRulesAsync(cancellationToken);
        return replenishmentRules
            .Select(MapReplenishmentRule)
            .ToArray();
    }

    public async Task<ReplenishmentRuleDto?> GetReplenishmentRuleByIdAsync(
        Guid replenishmentRuleId,
        CancellationToken cancellationToken)
    {
        var replenishmentRule = await repository.FindReplenishmentRuleByIdAsync(replenishmentRuleId, cancellationToken);
        return replenishmentRule is null ? null : MapReplenishmentRule(replenishmentRule);
    }

    public async Task<ReplenishmentRuleDto> CreateReplenishmentRuleAsync(
        CreateReplenishmentRuleCommand command,
        CancellationToken cancellationToken)
    {
        ValidateRuleQuantities(command.MinimumThreshold, command.TargetQuantity);

        var product = await repository.FindProductByIdAsync(command.ProductId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{command.ProductId}' was not found.");

        var targetLocation = await GetRequiredLocationAsync(command.TargetLocationId, cancellationToken);

        ValidateReplenishmentTargetLocation(targetLocation);

        if (await repository.HasConflictingActiveReplenishmentRuleAsync(
                product.Id,
                targetLocation.Id,
                excludedRuleId: null,
                cancellationToken))
        {
            throw new InvalidOperationException(
                $"An active replenishment rule already exists for product '{product.Sku}' and target location '{targetLocation.Code}'.");
        }

        var timestamp = DateTimeOffset.UtcNow;
        var replenishmentRule = new ReplenishmentRule
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Product = product,
            TargetLocationId = targetLocation.Id,
            TargetLocation = targetLocation,
            MinimumThreshold = decimal.Round(command.MinimumThreshold, 2, MidpointRounding.AwayFromZero),
            TargetQuantity = decimal.Round(command.TargetQuantity, 2, MidpointRounding.AwayFromZero),
            IsActive = true,
            CreatedAtUtc = timestamp,
            UpdatedAtUtc = timestamp,
        };

        repository.AddReplenishmentRule(replenishmentRule);
        await repository.SaveChangesAsync(cancellationToken);

        return MapReplenishmentRule(replenishmentRule);
    }

    public async Task<ReplenishmentRuleDto> UpdateReplenishmentRuleAsync(
        Guid replenishmentRuleId,
        UpdateReplenishmentRuleCommand command,
        CancellationToken cancellationToken)
    {
        ValidateRuleQuantities(command.MinimumThreshold, command.TargetQuantity);

        var replenishmentRule = await repository.FindReplenishmentRuleByIdAsync(replenishmentRuleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Replenishment rule '{replenishmentRuleId}' was not found.");

        var product = await repository.FindProductByIdAsync(command.ProductId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{command.ProductId}' was not found.");

        var targetLocation = await GetRequiredLocationAsync(command.TargetLocationId, cancellationToken);

        ValidateReplenishmentTargetLocation(targetLocation);

        if (replenishmentRule.IsActive &&
            await repository.HasConflictingActiveReplenishmentRuleAsync(
                product.Id,
                targetLocation.Id,
                replenishmentRule.Id,
                cancellationToken))
        {
            throw new InvalidOperationException(
                $"An active replenishment rule already exists for product '{product.Sku}' and target location '{targetLocation.Code}'.");
        }

        replenishmentRule.ProductId = product.Id;
        replenishmentRule.Product = product;
        replenishmentRule.TargetLocationId = targetLocation.Id;
        replenishmentRule.TargetLocation = targetLocation;
        replenishmentRule.MinimumThreshold = decimal.Round(command.MinimumThreshold, 2, MidpointRounding.AwayFromZero);
        replenishmentRule.TargetQuantity = decimal.Round(command.TargetQuantity, 2, MidpointRounding.AwayFromZero);
        replenishmentRule.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapReplenishmentRule(replenishmentRule);
    }

    public async Task<ReplenishmentRuleDto> DeactivateReplenishmentRuleAsync(
        Guid replenishmentRuleId,
        CancellationToken cancellationToken)
    {
        var replenishmentRule = await repository.FindReplenishmentRuleByIdAsync(replenishmentRuleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Replenishment rule '{replenishmentRuleId}' was not found.");

        replenishmentRule.IsActive = false;
        replenishmentRule.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapReplenishmentRule(replenishmentRule);
    }

    public async Task<IReadOnlyList<ReplenishmentTaskDto>> ListReplenishmentTasksAsync(CancellationToken cancellationToken)
    {
        var replenishmentTasks = await repository.ListReplenishmentTasksAsync(cancellationToken);
        return replenishmentTasks
            .Select(MapReplenishmentTask)
            .ToArray();
    }

    public async Task<ReplenishmentTaskDto?> GetReplenishmentTaskByIdAsync(
        Guid replenishmentTaskId,
        CancellationToken cancellationToken)
    {
        var replenishmentTask = await repository.FindReplenishmentTaskByIdAsync(replenishmentTaskId, cancellationToken);
        return replenishmentTask is null ? null : MapReplenishmentTask(replenishmentTask);
    }

    public async Task<ReplenishmentTaskDto> CreateReplenishmentTaskAsync(
        CreateReplenishmentTaskCommand command,
        CancellationToken cancellationToken)
    {
        ValidatePositiveQuantity(command.Quantity, nameof(command.Quantity));

        var product = await repository.FindProductByIdAsync(command.ProductId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{command.ProductId}' was not found.");

        var locationsById = await repository.FindLocationsByIdsAsync(
            [command.SourceLocationId, command.TargetLocationId],
            cancellationToken);

        var sourceLocation = GetRequiredLocation(locationsById, command.SourceLocationId);
        var targetLocation = GetRequiredLocation(locationsById, command.TargetLocationId);

        ValidateReplenishmentTaskLocations(sourceLocation, targetLocation);

        var replenishmentRule = await repository.FindActiveReplenishmentRuleAsync(
                product.Id,
                targetLocation.Id,
                cancellationToken) ??
            throw new InvalidOperationException(
                $"An active replenishment rule does not exist for product '{product.Sku}' and target location '{targetLocation.Code}'.");

        var targetBalance = await repository.FindInventoryBalanceAsync(product.Id, targetLocation.Id, cancellationToken);
        var targetAvailableQuantity = targetBalance?.AvailableQuantity ?? 0m;
        if (targetAvailableQuantity >= replenishmentRule.MinimumThreshold)
        {
            throw new InvalidOperationException(
                $"Target location '{targetLocation.Code}' for product '{product.Sku}' is not below the configured replenishment threshold.");
        }

        await EnsureSourceHasAvailableStockAsync(product.Id, sourceLocation.Id, command.Quantity, cancellationToken);

        var replenishmentTask = new ReplenishmentTask
        {
            Id = Guid.NewGuid(),
            ReplenishmentRuleId = replenishmentRule.Id,
            ReplenishmentRule = replenishmentRule,
            ProductId = product.Id,
            Product = product,
            SourceLocationId = sourceLocation.Id,
            SourceLocation = sourceLocation,
            TargetLocationId = targetLocation.Id,
            TargetLocation = targetLocation,
            Quantity = decimal.Round(command.Quantity, 2, MidpointRounding.AwayFromZero),
            Status = ReplenishmentTaskStatus.Pending,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        repository.AddReplenishmentTask(replenishmentTask);
        await repository.SaveChangesAsync(cancellationToken);

        return MapReplenishmentTask(replenishmentTask);
    }

    public async Task<ReplenishmentTaskDto> StartReplenishmentTaskAsync(
        Guid replenishmentTaskId,
        CancellationToken cancellationToken)
    {
        var replenishmentTask = await repository.FindReplenishmentTaskByIdAsync(replenishmentTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Replenishment task '{replenishmentTaskId}' was not found.");

        EnsureReplenishmentTaskStatus(
            replenishmentTask,
            ReplenishmentTaskStatus.Pending,
            "Only pending replenishment tasks can be started.");

        ValidateReplenishmentTaskLocations(replenishmentTask.SourceLocation, replenishmentTask.TargetLocation);
        await EnsureSourceHasAvailableStockAsync(
            replenishmentTask.ProductId,
            replenishmentTask.SourceLocationId,
            replenishmentTask.Quantity,
            cancellationToken);

        replenishmentTask.Status = ReplenishmentTaskStatus.InProgress;
        replenishmentTask.StartedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapReplenishmentTask(replenishmentTask);
    }

    public async Task<ReplenishmentTaskDto> CompleteReplenishmentTaskAsync(
        Guid replenishmentTaskId,
        Guid performedByUserId,
        CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var replenishmentTask = await repository.FindReplenishmentTaskByIdAsync(replenishmentTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Replenishment task '{replenishmentTaskId}' was not found.");

        EnsureReplenishmentTaskStatus(
            replenishmentTask,
            ReplenishmentTaskStatus.InProgress,
            "Only in-progress replenishment tasks can be completed.");

        ValidateReplenishmentTaskLocations(replenishmentTask.SourceLocation, replenishmentTask.TargetLocation);

        var timestamp = DateTimeOffset.UtcNow;
        var sourceBalance = await repository.FindInventoryBalanceAsync(
                replenishmentTask.ProductId,
                replenishmentTask.SourceLocationId,
                cancellationToken) ??
            throw new InvalidOperationException(
                $"Source location '{replenishmentTask.SourceLocation.Code}' does not have stock for product '{replenishmentTask.Product.Sku}'.");

        if (sourceBalance.AvailableQuantity < replenishmentTask.Quantity)
        {
            throw new InvalidOperationException(
                $"Replenishment quantity for product '{replenishmentTask.Product.Sku}' exceeds the available stock in source location '{replenishmentTask.SourceLocation.Code}'.");
        }

        var targetBalance = await repository.FindInventoryBalanceAsync(
            replenishmentTask.ProductId,
            replenishmentTask.TargetLocationId,
            cancellationToken);

        if (targetBalance is null)
        {
            targetBalance = new InventoryBalance
            {
                Id = Guid.NewGuid(),
                ProductId = replenishmentTask.ProductId,
                Product = replenishmentTask.Product,
                LocationId = replenishmentTask.TargetLocationId,
                Location = replenishmentTask.TargetLocation,
                OnHandQuantity = 0m,
                ReservedQuantity = 0m,
                UpdatedAtUtc = timestamp,
            };

            repository.AddInventoryBalance(targetBalance);
        }

        sourceBalance.OnHandQuantity -= replenishmentTask.Quantity;
        sourceBalance.UpdatedAtUtc = timestamp;

        targetBalance.OnHandQuantity += replenishmentTask.Quantity;
        targetBalance.UpdatedAtUtc = timestamp;

        repository.AddInventoryMovement(new InventoryMovement
        {
            Id = Guid.NewGuid(),
            ProductId = replenishmentTask.ProductId,
            Product = replenishmentTask.Product,
            Quantity = replenishmentTask.Quantity,
            MovementType = InventoryMovementType.Relocation,
            SourceLocationId = replenishmentTask.SourceLocationId,
            SourceLocation = replenishmentTask.SourceLocation,
            DestinationLocationId = replenishmentTask.TargetLocationId,
            DestinationLocation = replenishmentTask.TargetLocation,
            ReferenceType = "ReplenishmentTask",
            ReferenceId = replenishmentTask.Id.ToString(),
            PerformedAtUtc = timestamp,
            PerformedByUserId = performedByUserId,
        });

        replenishmentTask.Status = ReplenishmentTaskStatus.Completed;
        replenishmentTask.CompletedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "ReplenishmentCompleted",
            "ReplenishmentTask",
            replenishmentTask.Id.ToString(),
            $"Completed replenishment task '{replenishmentTask.Id}' for product '{replenishmentTask.Product.Sku}'.",
            new
            {
                statusFrom = ReplenishmentTaskStatus.InProgress,
                statusTo = ReplenishmentTaskStatus.Completed,
                replenishmentRuleId = replenishmentTask.ReplenishmentRuleId,
                productId = replenishmentTask.ProductId,
                quantity = replenishmentTask.Quantity,
                sourceLocationId = replenishmentTask.SourceLocationId,
                targetLocationId = replenishmentTask.TargetLocationId,
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapReplenishmentTask(replenishmentTask);
    }

    public async Task<ReplenishmentTaskDto> CancelReplenishmentTaskAsync(
        Guid replenishmentTaskId,
        CancellationToken cancellationToken)
    {
        var replenishmentTask = await repository.FindReplenishmentTaskByIdAsync(replenishmentTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Replenishment task '{replenishmentTaskId}' was not found.");

        if (!string.Equals(replenishmentTask.Status, ReplenishmentTaskStatus.Pending, StringComparison.Ordinal) &&
            !string.Equals(replenishmentTask.Status, ReplenishmentTaskStatus.InProgress, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only pending or in-progress replenishment tasks can be cancelled.");
        }

        replenishmentTask.Status = ReplenishmentTaskStatus.Cancelled;
        replenishmentTask.CancelledAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapReplenishmentTask(replenishmentTask);
    }

    private async Task<Location> GetRequiredLocationAsync(Guid locationId, CancellationToken cancellationToken)
    {
        var locationsById = await repository.FindLocationsByIdsAsync([locationId], cancellationToken);
        return GetRequiredLocation(locationsById, locationId);
    }

    private async Task EnsureSourceHasAvailableStockAsync(
        Guid productId,
        Guid sourceLocationId,
        decimal quantity,
        CancellationToken cancellationToken)
    {
        var balance = await repository.FindInventoryBalanceAsync(productId, sourceLocationId, cancellationToken);
        if (balance is null || balance.AvailableQuantity < quantity)
        {
            throw new InvalidOperationException("Replenishment quantity cannot exceed the available stock in the source location.");
        }
    }

    private static ReplenishmentRuleDto MapReplenishmentRule(ReplenishmentRule replenishmentRule) =>
        new(
            replenishmentRule.Id,
            replenishmentRule.ProductId,
            replenishmentRule.Product.Sku,
            replenishmentRule.Product.Name,
            replenishmentRule.TargetLocationId,
            replenishmentRule.TargetLocation.Warehouse.Code,
            replenishmentRule.TargetLocation.Zone.Code,
            replenishmentRule.TargetLocation.Code,
            replenishmentRule.TargetLocation.Name,
            replenishmentRule.TargetLocation.LocationType,
            replenishmentRule.TargetLocation.IsActive,
            replenishmentRule.TargetLocation.IsBlocked,
            replenishmentRule.MinimumThreshold,
            replenishmentRule.TargetQuantity,
            replenishmentRule.IsActive,
            replenishmentRule.CreatedAtUtc,
            replenishmentRule.UpdatedAtUtc);

    private static ReplenishmentTaskDto MapReplenishmentTask(ReplenishmentTask replenishmentTask) =>
        new(
            replenishmentTask.Id,
            replenishmentTask.ReplenishmentRuleId,
            replenishmentTask.ProductId,
            replenishmentTask.Product.Sku,
            replenishmentTask.Product.Name,
            replenishmentTask.SourceLocationId,
            replenishmentTask.SourceLocation.Warehouse.Code,
            replenishmentTask.SourceLocation.Zone.Code,
            replenishmentTask.SourceLocation.Code,
            replenishmentTask.SourceLocation.Name,
            replenishmentTask.SourceLocation.LocationType,
            replenishmentTask.SourceLocation.IsActive,
            replenishmentTask.SourceLocation.IsBlocked,
            replenishmentTask.TargetLocationId,
            replenishmentTask.TargetLocation.Warehouse.Code,
            replenishmentTask.TargetLocation.Zone.Code,
            replenishmentTask.TargetLocation.Code,
            replenishmentTask.TargetLocation.Name,
            replenishmentTask.TargetLocation.LocationType,
            replenishmentTask.TargetLocation.IsActive,
            replenishmentTask.TargetLocation.IsBlocked,
            replenishmentTask.Quantity,
            replenishmentTask.Status,
            replenishmentTask.CreatedAtUtc,
            replenishmentTask.StartedAtUtc,
            replenishmentTask.CompletedAtUtc,
            replenishmentTask.CancelledAtUtc);

    private static Location GetRequiredLocation(IReadOnlyDictionary<Guid, Location> locationsById, Guid locationId)
    {
        if (locationsById.TryGetValue(locationId, out var location))
        {
            return location;
        }

        throw new KeyNotFoundException($"Location '{locationId}' was not found.");
    }

    private static void ValidateRuleQuantities(decimal minimumThreshold, decimal targetQuantity)
    {
        ValidateNonNegativeQuantity(minimumThreshold, nameof(minimumThreshold));

        if (targetQuantity <= minimumThreshold)
        {
            throw new ArgumentException(
                "Target quantity must be greater than the minimum threshold.",
                nameof(targetQuantity));
        }
    }

    private static void ValidateReplenishmentTargetLocation(Location targetLocation)
    {
        if (!targetLocation.IsActive)
        {
            throw new InvalidOperationException(
                $"Replenishment target location '{targetLocation.Code}' must be active.");
        }

        if (targetLocation.IsBlocked)
        {
            throw new InvalidOperationException(
                $"Replenishment target location '{targetLocation.Code}' must be unblocked.");
        }

        if (!string.Equals(targetLocation.LocationType, LocationType.Picking, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Replenishment target location '{targetLocation.Code}' must be of type {LocationType.Picking}.");
        }
    }

    private static void ValidateReplenishmentTaskLocations(Location sourceLocation, Location targetLocation)
    {
        if (sourceLocation.Id == targetLocation.Id)
        {
            throw new InvalidOperationException("Replenishment source and target locations must be different.");
        }

        if (!sourceLocation.IsActive)
        {
            throw new InvalidOperationException(
                $"Replenishment source location '{sourceLocation.Code}' must be active.");
        }

        ValidateReplenishmentTargetLocation(targetLocation);
    }

    private static void EnsureReplenishmentTaskStatus(
        ReplenishmentTask replenishmentTask,
        string expectedStatus,
        string message)
    {
        if (!string.Equals(replenishmentTask.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static void ValidateNonNegativeQuantity(decimal quantity, string parameterName)
    {
        if (quantity < 0m)
        {
            throw new ArgumentException("Value must be zero or greater.", parameterName);
        }
    }

    private static void ValidatePositiveQuantity(decimal quantity, string parameterName)
    {
        if (quantity <= 0m)
        {
            throw new ArgumentException("Value must be greater than zero.", parameterName);
        }
    }
}
