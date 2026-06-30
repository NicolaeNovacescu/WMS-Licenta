using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.InventoryCount.Abstractions;
using Wms.Application.InventoryCount.Models;
using Wms.Domain.Inventory;
using Wms.Domain.InventoryCount;
using InventoryCountEntity = Wms.Domain.InventoryCount.InventoryCount;
using InventoryCountLineEntity = Wms.Domain.InventoryCount.InventoryCountLine;

namespace Wms.Application.InventoryCount;

public sealed class InventoryCountWorkflowService(
    IInventoryCountWorkflowRepository repository,
    IAuditLogWriter? auditLogWriter = null)
{
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<InventoryCountDto>> ListInventoryCountsAsync(CancellationToken cancellationToken)
    {
        var inventoryCounts = await repository.ListInventoryCountsAsync(cancellationToken);
        return inventoryCounts
            .Select(MapInventoryCount)
            .ToArray();
    }

    public async Task<InventoryCountDto?> GetInventoryCountByIdAsync(Guid inventoryCountId, CancellationToken cancellationToken)
    {
        var inventoryCount = await repository.FindInventoryCountByIdAsync(inventoryCountId, cancellationToken);
        return inventoryCount is null ? null : MapInventoryCount(inventoryCount);
    }

    public async Task<InventoryCountDto> CreateInventoryCountAsync(
        CreateInventoryCountCommand command,
        CancellationToken cancellationToken)
    {
        var lineCommands = NormalizeCreateLines(command.Lines);
        var productsById = await repository.FindProductsByIdsAsync(
            lineCommands.Select(line => line.ProductId).Distinct().ToArray(),
            cancellationToken);
        var locationsById = await repository.FindLocationsByIdsAsync(
            lineCommands.Select(line => line.LocationId).Distinct().ToArray(),
            cancellationToken);

        EnsureEntitiesExist(lineCommands, productsById, locationsById);

        var balancesByKey = await GetBalancesByKeyAsync(lineCommands, cancellationToken);
        var timestamp = DateTimeOffset.UtcNow;

        var inventoryCount = new InventoryCountEntity
        {
            Id = Guid.NewGuid(),
            Status = InventoryCountStatus.Draft,
            CreatedAtUtc = timestamp,
        };

        foreach (var lineCommand in lineCommands)
        {
            var product = productsById[lineCommand.ProductId];
            var location = locationsById[lineCommand.LocationId];
            balancesByKey.TryGetValue((lineCommand.ProductId, lineCommand.LocationId), out var inventoryBalance);

            inventoryCount.Lines.Add(new InventoryCountLineEntity
            {
                Id = Guid.NewGuid(),
                InventoryCountId = inventoryCount.Id,
                InventoryCount = inventoryCount,
                ProductId = product.Id,
                Product = product,
                LocationId = location.Id,
                Location = location,
                InventoryBalanceId = inventoryBalance?.Id,
                InventoryBalance = inventoryBalance,
                ExpectedSystemQuantity = inventoryBalance?.OnHandQuantity ?? 0m,
                CountedQuantity = null,
                VarianceQuantity = null,
            });
        }

        repository.AddInventoryCount(inventoryCount);
        await repository.SaveChangesAsync(cancellationToken);

        return MapInventoryCount(inventoryCount);
    }

    public async Task<InventoryCountDto> StartInventoryCountAsync(Guid inventoryCountId, CancellationToken cancellationToken)
    {
        var inventoryCount = await repository.FindInventoryCountByIdAsync(inventoryCountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Inventory count '{inventoryCountId}' was not found.");

        EnsureInventoryCountStatus(
            inventoryCount,
            InventoryCountStatus.Draft,
            "Only draft inventory counts can be started.");
        EnsureHasLines(inventoryCount.Lines, "Inventory count");

        inventoryCount.Status = InventoryCountStatus.InProgress;
        inventoryCount.StartedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapInventoryCount(inventoryCount);
    }

    public async Task<InventoryCountDto> CompleteInventoryCountAsync(
        Guid inventoryCountId,
        CompleteInventoryCountCommand command,
        Guid performedByUserId,
        CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var inventoryCount = await repository.FindInventoryCountByIdAsync(inventoryCountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Inventory count '{inventoryCountId}' was not found.");

        EnsureInventoryCountStatus(
            inventoryCount,
            InventoryCountStatus.InProgress,
            "Only in-progress inventory counts can be completed.");
        EnsureHasLines(inventoryCount.Lines, "Inventory count");

        var submittedLines = NormalizeCompleteLines(command.Lines);
        EnsureSubmittedLinesMatchInventoryCount(inventoryCount, submittedLines);

        var balancesByKey = await GetBalancesByKeyAsync(
            inventoryCount.Lines.Select(line => (line.ProductId, line.LocationId)).ToArray(),
            cancellationToken);

        var timestamp = DateTimeOffset.UtcNow;
        var submittedLineMap = submittedLines.ToDictionary(line => line.InventoryCountLineId);

        foreach (var line in inventoryCount.Lines)
        {
            var submittedLine = submittedLineMap[line.Id];
            var countedQuantity = submittedLine.CountedQuantity;
            var currentBalance = balancesByKey.GetValueOrDefault((line.ProductId, line.LocationId));
            var currentOnHandQuantity = currentBalance?.OnHandQuantity ?? 0m;

            if (currentOnHandQuantity != line.ExpectedSystemQuantity)
            {
                throw new InvalidOperationException(
                    $"Inventory count line '{line.Id}' can no longer be completed because the system quantity changed after the count was created.");
            }

            var currentReservedQuantity = currentBalance?.ReservedQuantity ?? 0m;
            var currentPickedQuantity = currentBalance?.PickedQuantity ?? 0m;
            var varianceQuantity = countedQuantity - line.ExpectedSystemQuantity;
            var resultingOnHandQuantity = currentOnHandQuantity + varianceQuantity;

            if (resultingOnHandQuantity < currentReservedQuantity + currentPickedQuantity)
            {
                throw new InvalidOperationException(
                    $"Inventory count line '{line.Id}' would reduce on-hand stock below the currently reserved and picked quantity at location '{line.Location.Code}'.");
            }

            line.CountedQuantity = countedQuantity;
            line.VarianceQuantity = varianceQuantity;

            if (varianceQuantity > 0m)
            {
                if (currentBalance is null)
                {
                    currentBalance = CreateInventoryBalanceFromCountLine(line, timestamp);
                    repository.AddInventoryBalance(currentBalance);
                    balancesByKey[(line.ProductId, line.LocationId)] = currentBalance;
                }

                currentBalance.OnHandQuantity += varianceQuantity;
                currentBalance.UpdatedAtUtc = timestamp;
                line.InventoryBalanceId = currentBalance.Id;
                line.InventoryBalance = currentBalance;

                repository.AddInventoryMovement(new InventoryMovement
                {
                    Id = Guid.NewGuid(),
                    ProductId = line.ProductId,
                    Product = line.Product,
                    Quantity = varianceQuantity,
                    MovementType = InventoryMovementType.Addition,
                    SourceLocationId = null,
                    SourceLocation = null,
                    DestinationLocationId = line.LocationId,
                    DestinationLocation = line.Location,
                    ReferenceType = "InventoryCount",
                    ReferenceId = inventoryCount.Id.ToString(),
                    PerformedAtUtc = timestamp,
                    PerformedByUserId = performedByUserId,
                });
            }
            else if (varianceQuantity < 0m)
            {
                if (currentBalance is null)
                {
                    throw new InvalidOperationException(
                        $"Inventory count line '{line.Id}' cannot post a negative variance because no current inventory balance exists.");
                }

                currentBalance.OnHandQuantity += varianceQuantity;
                currentBalance.UpdatedAtUtc = timestamp;

                repository.AddInventoryMovement(new InventoryMovement
                {
                    Id = Guid.NewGuid(),
                    ProductId = line.ProductId,
                    Product = line.Product,
                    Quantity = decimal.Abs(varianceQuantity),
                    MovementType = InventoryMovementType.Removal,
                    SourceLocationId = line.LocationId,
                    SourceLocation = line.Location,
                    DestinationLocationId = null,
                    DestinationLocation = null,
                    ReferenceType = "InventoryCount",
                    ReferenceId = inventoryCount.Id.ToString(),
                    PerformedAtUtc = timestamp,
                    PerformedByUserId = performedByUserId,
                });
            }
            else if (currentBalance is not null)
            {
                currentBalance.UpdatedAtUtc = timestamp;
                line.InventoryBalanceId = currentBalance.Id;
                line.InventoryBalance = currentBalance;
            }
        }

        inventoryCount.Status = InventoryCountStatus.Completed;
        inventoryCount.CompletedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "InventoryCountCompleted",
            "InventoryCount",
            inventoryCount.Id.ToString(),
            $"Completed inventory count '{inventoryCount.Id}' and posted reconciliation adjustments.",
            new
            {
                statusFrom = InventoryCountStatus.InProgress,
                statusTo = InventoryCountStatus.Completed,
                lineCount = inventoryCount.Lines.Count,
                positiveVarianceTotal = inventoryCount.Lines
                    .Where(line => (line.VarianceQuantity ?? 0m) > 0m)
                    .Sum(line => line.VarianceQuantity ?? 0m),
                negativeVarianceTotal = inventoryCount.Lines
                    .Where(line => (line.VarianceQuantity ?? 0m) < 0m)
                    .Sum(line => decimal.Abs(line.VarianceQuantity ?? 0m)),
                zeroVarianceLineCount = inventoryCount.Lines.Count(line => (line.VarianceQuantity ?? 0m) == 0m),
                productIds = inventoryCount.Lines.Select(line => line.ProductId).Distinct().ToArray(),
                locationIds = inventoryCount.Lines.Select(line => line.LocationId).Distinct().ToArray(),
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapInventoryCount(inventoryCount);
    }

    public async Task<InventoryCountDto> CancelInventoryCountAsync(Guid inventoryCountId, CancellationToken cancellationToken)
    {
        var inventoryCount = await repository.FindInventoryCountByIdAsync(inventoryCountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Inventory count '{inventoryCountId}' was not found.");

        if (!string.Equals(inventoryCount.Status, InventoryCountStatus.Draft, StringComparison.Ordinal) &&
            !string.Equals(inventoryCount.Status, InventoryCountStatus.InProgress, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only draft or in-progress inventory counts can be cancelled.");
        }

        inventoryCount.Status = InventoryCountStatus.Cancelled;
        inventoryCount.CancelledAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapInventoryCount(inventoryCount);
    }

    private async Task<Dictionary<(Guid ProductId, Guid LocationId), InventoryBalance>> GetBalancesByKeyAsync(
        IReadOnlyCollection<CreateInventoryCountLineCommand> lineCommands,
        CancellationToken cancellationToken) =>
        await GetBalancesByKeyAsync(
            lineCommands.Select(line => (line.ProductId, line.LocationId)).ToArray(),
            cancellationToken);

    private async Task<Dictionary<(Guid ProductId, Guid LocationId), InventoryBalance>> GetBalancesByKeyAsync(
        IReadOnlyCollection<(Guid ProductId, Guid LocationId)> lineKeys,
        CancellationToken cancellationToken)
    {
        var productIds = lineKeys.Select(key => key.ProductId).Distinct().ToArray();
        var locationIds = lineKeys.Select(key => key.LocationId).Distinct().ToArray();
        var balances = await repository.ListInventoryBalancesByProductIdsAndLocationIdsAsync(
            productIds,
            locationIds,
            cancellationToken);

        return balances.ToDictionary(balance => (balance.ProductId, balance.LocationId));
    }

    private static InventoryBalance CreateInventoryBalanceFromCountLine(
        InventoryCountLineEntity line,
        DateTimeOffset timestamp) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductId = line.ProductId,
            Product = line.Product,
            LocationId = line.LocationId,
            Location = line.Location,
            OnHandQuantity = 0m,
            ReservedQuantity = 0m,
            PickedQuantity = 0m,
            UpdatedAtUtc = timestamp,
        };

    private static InventoryCountDto MapInventoryCount(InventoryCountEntity inventoryCount) =>
        new(
            inventoryCount.Id,
            inventoryCount.Status,
            inventoryCount.CreatedAtUtc,
            inventoryCount.StartedAtUtc,
            inventoryCount.CompletedAtUtc,
            inventoryCount.CancelledAtUtc,
            inventoryCount.Lines
                .OrderBy(line => line.Product.Sku, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.Location.Warehouse.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.Location.Zone.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.Location.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.Id)
                .Select(line => new InventoryCountLineDto(
                    line.Id,
                    line.ProductId,
                    line.Product.Sku,
                    line.Product.Name,
                    line.LocationId,
                    line.Location.Warehouse.Code,
                    line.Location.Zone.Code,
                    line.Location.Code,
                    line.Location.Name,
                    line.Location.LocationType,
                    line.Location.IsActive,
                    line.Location.IsBlocked,
                    line.InventoryBalanceId,
                    line.ExpectedSystemQuantity,
                    line.CountedQuantity,
                    line.VarianceQuantity))
                .ToArray());

    private static CreateInventoryCountLineCommand[] NormalizeCreateLines(
        IReadOnlyCollection<CreateInventoryCountLineCommand>? lines)
    {
        EnsureHasLines(lines, "Inventory count");

        var normalizedLines = lines!
            .ToArray();

        var duplicateLine = normalizedLines
            .GroupBy(line => new { line.ProductId, line.LocationId })
            .FirstOrDefault(group => group.Count() > 1);

        if (duplicateLine is not null)
        {
            throw new ArgumentException(
                $"Inventory count lines must reference each product and location combination only once. Duplicate product '{duplicateLine.Key.ProductId}' and location '{duplicateLine.Key.LocationId}' was provided.",
                nameof(lines));
        }

        return normalizedLines;
    }

    private static CompleteInventoryCountLineCommand[] NormalizeCompleteLines(
        IReadOnlyCollection<CompleteInventoryCountLineCommand>? lines)
    {
        EnsureHasLines(lines, "Inventory count completion");

        var normalizedLines = lines!
            .Select(line => line with
            {
                CountedQuantity = decimal.Round(line.CountedQuantity, 2, MidpointRounding.AwayFromZero),
            })
            .ToArray();

        var duplicateLineId = normalizedLines
            .GroupBy(line => line.InventoryCountLineId)
            .Where(group => group.Count() > 1)
            .Select(group => (Guid?)group.Key)
            .FirstOrDefault();

        if (duplicateLineId.HasValue)
        {
            throw new ArgumentException(
                $"Inventory count completion lines must reference each count line only once. Duplicate line '{duplicateLineId.Value}' was provided.",
                nameof(lines));
        }

        foreach (var line in normalizedLines)
        {
            if (line.CountedQuantity < 0m)
            {
                throw new ArgumentException("Counted quantity cannot be negative.", nameof(lines));
            }
        }

        return normalizedLines;
    }

    private static void EnsureEntitiesExist(
        IEnumerable<CreateInventoryCountLineCommand> lineCommands,
        IReadOnlyDictionary<Guid, Wms.Domain.Catalog.Product> productsById,
        IReadOnlyDictionary<Guid, Wms.Domain.WarehouseStructure.Location> locationsById)
    {
        foreach (var line in lineCommands)
        {
            if (!productsById.ContainsKey(line.ProductId))
            {
                throw new KeyNotFoundException($"Product '{line.ProductId}' was not found.");
            }

            if (!locationsById.ContainsKey(line.LocationId))
            {
                throw new KeyNotFoundException($"Location '{line.LocationId}' was not found.");
            }
        }
    }

    private static void EnsureSubmittedLinesMatchInventoryCount(
        InventoryCountEntity inventoryCount,
        IReadOnlyCollection<CompleteInventoryCountLineCommand> submittedLines)
    {
        if (inventoryCount.Lines.Count != submittedLines.Count)
        {
            throw new ArgumentException(
                "Inventory count completion must provide counted quantities for every count line.",
                nameof(submittedLines));
        }

        var inventoryCountLineIds = inventoryCount.Lines.Select(line => line.Id).ToHashSet();
        foreach (var submittedLine in submittedLines)
        {
            if (!inventoryCountLineIds.Contains(submittedLine.InventoryCountLineId))
            {
                throw new ArgumentException(
                    $"Inventory count line '{submittedLine.InventoryCountLineId}' does not belong to inventory count '{inventoryCount.Id}'.",
                    nameof(submittedLines));
            }
        }
    }

    private static void EnsureInventoryCountStatus(InventoryCountEntity inventoryCount, string expectedStatus, string message)
    {
        if (!string.Equals(inventoryCount.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static void EnsureHasLines<T>(IEnumerable<T>? lines, string entityName)
    {
        if (lines is null || !lines.Any())
        {
            throw new ArgumentException($"{entityName} must include at least one line.", nameof(lines));
        }
    }
}
