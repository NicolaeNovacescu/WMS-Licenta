using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Putaway.Abstractions;
using Wms.Application.Putaway.Models;
using Wms.Domain.Inventory;
using Wms.Domain.Putaway;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Putaway;

public sealed class PutawayWorkflowService(IPutawayWorkflowRepository repository, IAuditLogWriter? auditLogWriter = null)
{
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<PutawayTaskDto>> ListPutawayTasksAsync(CancellationToken cancellationToken)
    {
        var putawayTasks = await repository.ListPutawayTasksAsync(cancellationToken);
        return putawayTasks
            .Select(MapPutawayTask)
            .ToArray();
    }

    public async Task<PutawayTaskDto?> GetPutawayTaskByIdAsync(Guid putawayTaskId, CancellationToken cancellationToken)
    {
        var putawayTask = await repository.FindPutawayTaskByIdAsync(putawayTaskId, cancellationToken);
        return putawayTask is null ? null : MapPutawayTask(putawayTask);
    }

    public async Task<PutawayTaskDto> CreatePutawayTaskAsync(
        CreatePutawayTaskCommand command,
        CancellationToken cancellationToken)
    {
        ValidatePositiveQuantity(command.Quantity, nameof(command.Quantity));

        var product = await repository.FindProductByIdAsync(command.ProductId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{command.ProductId}' was not found.");

        var locationsById = await repository.FindLocationsByIdsAsync(
            [command.SourceLocationId, command.DestinationLocationId],
            cancellationToken);

        var sourceLocation = GetRequiredLocation(locationsById, command.SourceLocationId, nameof(command.SourceLocationId));
        var destinationLocation = GetRequiredLocation(locationsById, command.DestinationLocationId, nameof(command.DestinationLocationId));

        ValidatePutawayLocations(sourceLocation, destinationLocation);

        ReceiptLineTraceability? receiptTraceability = null;
        if (command.ReceiptLineId.HasValue)
        {
            receiptTraceability = await ValidateReceiptTraceabilityAsync(
                command.ReceiptLineId.Value,
                product.Id,
                sourceLocation.Id,
                cancellationToken);
        }

        await EnsureSourceHasAvailableStockAsync(product.Id, sourceLocation.Id, command.Quantity, cancellationToken);

        var timestamp = DateTimeOffset.UtcNow;
        var putawayTask = new PutawayTask
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Product = product,
            SourceLocationId = sourceLocation.Id,
            SourceLocation = sourceLocation,
            DestinationLocationId = destinationLocation.Id,
            DestinationLocation = destinationLocation,
            ReceiptLineId = receiptTraceability?.ReceiptLineId,
            ReceiptLine = receiptTraceability?.ReceiptLine,
            Quantity = decimal.Round(command.Quantity, 2, MidpointRounding.AwayFromZero),
            Status = PutawayTaskStatus.Pending,
            Notes = NormalizeOptional(command.Notes),
            CreatedAtUtc = timestamp,
        };

        repository.AddPutawayTask(putawayTask);
        await repository.SaveChangesAsync(cancellationToken);

        return MapPutawayTask(putawayTask);
    }

    public async Task<PutawayTaskDto> StartPutawayTaskAsync(Guid putawayTaskId, CancellationToken cancellationToken)
    {
        var putawayTask = await repository.FindPutawayTaskByIdAsync(putawayTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Putaway task '{putawayTaskId}' was not found.");

        EnsurePutawayTaskStatus(
            putawayTask,
            PutawayTaskStatus.Pending,
            "Only pending putaway tasks can be started.");

        ValidatePutawayLocations(putawayTask.SourceLocation, putawayTask.DestinationLocation);
        await EnsureSourceHasAvailableStockAsync(
            putawayTask.ProductId,
            putawayTask.SourceLocationId,
            putawayTask.Quantity,
            cancellationToken);

        putawayTask.Status = PutawayTaskStatus.InProgress;
        putawayTask.StartedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapPutawayTask(putawayTask);
    }

    public async Task<PutawayTaskDto> CompletePutawayTaskAsync(
        Guid putawayTaskId,
        Guid performedByUserId,
        CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var putawayTask = await repository.FindPutawayTaskByIdAsync(putawayTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Putaway task '{putawayTaskId}' was not found.");

        EnsurePutawayTaskStatus(
            putawayTask,
            PutawayTaskStatus.InProgress,
            "Only in-progress putaway tasks can be completed.");

        ValidatePutawayLocations(putawayTask.SourceLocation, putawayTask.DestinationLocation);

        if (putawayTask.ReceiptLineId.HasValue)
        {
            await ValidateReceiptTraceabilityAsync(
                putawayTask.ReceiptLineId.Value,
                putawayTask.ProductId,
                putawayTask.SourceLocationId,
                cancellationToken);
        }

        var timestamp = DateTimeOffset.UtcNow;
        var sourceBalance = await repository.FindInventoryBalanceAsync(
                putawayTask.ProductId,
                putawayTask.SourceLocationId,
                cancellationToken) ??
            throw new InvalidOperationException(
                $"Source location '{putawayTask.SourceLocation.Code}' does not have stock for product '{putawayTask.Product.Sku}'.");

        if (sourceBalance.AvailableQuantity < putawayTask.Quantity)
        {
            throw new InvalidOperationException(
                $"Putaway quantity for product '{putawayTask.Product.Sku}' exceeds the available stock in source location '{putawayTask.SourceLocation.Code}'.");
        }

        var destinationBalance = await repository.FindInventoryBalanceAsync(
            putawayTask.ProductId,
            putawayTask.DestinationLocationId,
            cancellationToken);

        if (destinationBalance is null)
        {
            destinationBalance = new InventoryBalance
            {
                Id = Guid.NewGuid(),
                ProductId = putawayTask.ProductId,
                Product = putawayTask.Product,
                LocationId = putawayTask.DestinationLocationId,
                Location = putawayTask.DestinationLocation,
                OnHandQuantity = 0m,
                ReservedQuantity = 0m,
                UpdatedAtUtc = timestamp,
            };

            repository.AddInventoryBalance(destinationBalance);
        }

        sourceBalance.OnHandQuantity -= putawayTask.Quantity;
        sourceBalance.UpdatedAtUtc = timestamp;

        destinationBalance.OnHandQuantity += putawayTask.Quantity;
        destinationBalance.UpdatedAtUtc = timestamp;

        repository.AddInventoryMovement(new InventoryMovement
        {
            Id = Guid.NewGuid(),
            ProductId = putawayTask.ProductId,
            Product = putawayTask.Product,
            Quantity = putawayTask.Quantity,
            MovementType = InventoryMovementType.Relocation,
            SourceLocationId = putawayTask.SourceLocationId,
            SourceLocation = putawayTask.SourceLocation,
            DestinationLocationId = putawayTask.DestinationLocationId,
            DestinationLocation = putawayTask.DestinationLocation,
            ReferenceType = "PutawayTask",
            ReferenceId = putawayTask.Id.ToString(),
            PerformedAtUtc = timestamp,
            PerformedByUserId = performedByUserId,
            Notes = putawayTask.Notes,
        });

        putawayTask.Status = PutawayTaskStatus.Completed;
        putawayTask.CompletedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "PutawayCompleted",
            "PutawayTask",
            putawayTask.Id.ToString(),
            $"Completed putaway task '{putawayTask.Id}' for product '{putawayTask.Product.Sku}'.",
            new
            {
                statusFrom = PutawayTaskStatus.InProgress,
                statusTo = PutawayTaskStatus.Completed,
                productId = putawayTask.ProductId,
                quantity = putawayTask.Quantity,
                sourceLocationId = putawayTask.SourceLocationId,
                destinationLocationId = putawayTask.DestinationLocationId,
                receiptLineId = putawayTask.ReceiptLineId,
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapPutawayTask(putawayTask);
    }

    public async Task<PutawayTaskDto> CancelPutawayTaskAsync(Guid putawayTaskId, CancellationToken cancellationToken)
    {
        var putawayTask = await repository.FindPutawayTaskByIdAsync(putawayTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Putaway task '{putawayTaskId}' was not found.");

        if (!string.Equals(putawayTask.Status, PutawayTaskStatus.Pending, StringComparison.Ordinal) &&
            !string.Equals(putawayTask.Status, PutawayTaskStatus.InProgress, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only pending or in-progress putaway tasks can be cancelled.");
        }

        putawayTask.Status = PutawayTaskStatus.Cancelled;
        putawayTask.CancelledAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapPutawayTask(putawayTask);
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
            throw new InvalidOperationException("Putaway quantity cannot exceed the available stock in the source location.");
        }
    }

    private async Task<ReceiptLineTraceability> ValidateReceiptTraceabilityAsync(
        Guid receiptLineId,
        Guid productId,
        Guid sourceLocationId,
        CancellationToken cancellationToken)
    {
        var receiptLine = await repository.FindReceiptLineByIdAsync(receiptLineId, cancellationToken)
            ?? throw new KeyNotFoundException($"Receipt line '{receiptLineId}' was not found.");

        if (!string.Equals(receiptLine.Receipt.Status, Domain.Inbound.ReceiptStatus.Confirmed, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Putaway receipt traceability must reference a confirmed receipt line.");
        }

        if (receiptLine.InboundOrderLine.ProductId != productId)
        {
            throw new InvalidOperationException("Putaway product must match the linked receipt line product.");
        }

        if (receiptLine.ReceivingLocationId != sourceLocationId)
        {
            throw new InvalidOperationException("Putaway source location must match the linked receipt line receiving location.");
        }

        return new ReceiptLineTraceability(receiptLineId, receiptLine);
    }

    private static PutawayTaskDto MapPutawayTask(PutawayTask putawayTask) =>
        new(
            putawayTask.Id,
            putawayTask.ProductId,
            putawayTask.Product.Sku,
            putawayTask.Product.Name,
            putawayTask.SourceLocationId,
            putawayTask.SourceLocation.Warehouse.Code,
            putawayTask.SourceLocation.Zone.Code,
            putawayTask.SourceLocation.Code,
            putawayTask.SourceLocation.Name,
            putawayTask.SourceLocation.LocationType,
            putawayTask.SourceLocation.IsActive,
            putawayTask.SourceLocation.IsBlocked,
            putawayTask.DestinationLocationId,
            putawayTask.DestinationLocation.Warehouse.Code,
            putawayTask.DestinationLocation.Zone.Code,
            putawayTask.DestinationLocation.Code,
            putawayTask.DestinationLocation.Name,
            putawayTask.DestinationLocation.LocationType,
            putawayTask.DestinationLocation.IsActive,
            putawayTask.DestinationLocation.IsBlocked,
            putawayTask.ReceiptLineId,
            putawayTask.ReceiptLine?.ReceiptId,
            putawayTask.Quantity,
            putawayTask.Status,
            EmptyToNull(putawayTask.Notes),
            putawayTask.CreatedAtUtc,
            putawayTask.StartedAtUtc,
            putawayTask.CompletedAtUtc,
            putawayTask.CancelledAtUtc);

    private static Location GetRequiredLocation(
        IReadOnlyDictionary<Guid, Location> locationsById,
        Guid locationId,
        string parameterName)
    {
        if (locationsById.TryGetValue(locationId, out var location))
        {
            return location;
        }

        throw new KeyNotFoundException($"Location '{locationId}' was not found.");
    }

    private static void ValidatePutawayLocations(Location sourceLocation, Location destinationLocation)
    {
        if (sourceLocation.Id == destinationLocation.Id)
        {
            throw new InvalidOperationException("Putaway source and destination locations must be different.");
        }

        if (!string.Equals(sourceLocation.LocationType, LocationType.Receiving, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Putaway source location '{sourceLocation.Code}' must be of type {LocationType.Receiving}.");
        }

        if (!destinationLocation.IsActive)
        {
            throw new InvalidOperationException(
                $"Putaway destination location '{destinationLocation.Code}' must be active.");
        }

        if (destinationLocation.IsBlocked)
        {
            throw new InvalidOperationException(
                $"Putaway destination location '{destinationLocation.Code}' must be unblocked.");
        }

        if (string.Equals(destinationLocation.LocationType, LocationType.Receiving, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Putaway destination location '{destinationLocation.Code}' cannot be of type {LocationType.Receiving}.");
        }
    }

    private static void EnsurePutawayTaskStatus(PutawayTask putawayTask, string expectedStatus, string message)
    {
        if (!string.Equals(putawayTask.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static void ValidatePositiveQuantity(decimal quantity, string parameterName)
    {
        if (quantity <= 0m)
        {
            throw new ArgumentException("Value must be greater than zero.", parameterName);
        }
    }

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static string? EmptyToNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;

    private sealed record ReceiptLineTraceability(Guid ReceiptLineId, Domain.Inbound.ReceiptLine ReceiptLine);
}
