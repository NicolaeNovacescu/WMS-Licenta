using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Transfer.Abstractions;
using Wms.Application.Transfer.Models;
using Wms.Domain.Inventory;
using Wms.Domain.Transfer;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Transfer;

public sealed class TransferWorkflowService(ITransferWorkflowRepository repository, IAuditLogWriter? auditLogWriter = null)
{
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<TransferTaskDto>> ListTransferTasksAsync(CancellationToken cancellationToken)
    {
        var transferTasks = await repository.ListTransferTasksAsync(cancellationToken);
        return transferTasks
            .Select(MapTransferTask)
            .ToArray();
    }

    public async Task<TransferTaskDto?> GetTransferTaskByIdAsync(Guid transferTaskId, CancellationToken cancellationToken)
    {
        var transferTask = await repository.FindTransferTaskByIdAsync(transferTaskId, cancellationToken);
        return transferTask is null ? null : MapTransferTask(transferTask);
    }

    public async Task<TransferTaskDto> CreateTransferTaskAsync(
        CreateTransferTaskCommand command,
        CancellationToken cancellationToken)
    {
        ValidatePositiveQuantity(command.Quantity, nameof(command.Quantity));

        var product = await repository.FindProductByIdAsync(command.ProductId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{command.ProductId}' was not found.");

        var locationsById = await repository.FindLocationsByIdsAsync(
            [command.SourceLocationId, command.DestinationLocationId],
            cancellationToken);

        var sourceLocation = GetRequiredLocation(locationsById, command.SourceLocationId);
        var destinationLocation = GetRequiredLocation(locationsById, command.DestinationLocationId);

        ValidateTransferLocations(sourceLocation, destinationLocation);
        await EnsureSourceHasAvailableStockAsync(product.Id, sourceLocation.Id, command.Quantity, cancellationToken);

        var transferTask = new TransferTask
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Product = product,
            SourceLocationId = sourceLocation.Id,
            SourceLocation = sourceLocation,
            DestinationLocationId = destinationLocation.Id,
            DestinationLocation = destinationLocation,
            Quantity = decimal.Round(command.Quantity, 2, MidpointRounding.AwayFromZero),
            Status = TransferTaskStatus.Pending,
            Reason = NormalizeOptional(command.Reason),
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        repository.AddTransferTask(transferTask);
        await repository.SaveChangesAsync(cancellationToken);

        return MapTransferTask(transferTask);
    }

    public async Task<TransferTaskDto> StartTransferTaskAsync(Guid transferTaskId, CancellationToken cancellationToken)
    {
        var transferTask = await repository.FindTransferTaskByIdAsync(transferTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Transfer task '{transferTaskId}' was not found.");

        EnsureTransferTaskStatus(
            transferTask,
            TransferTaskStatus.Pending,
            "Only pending transfer tasks can be started.");

        ValidateTransferLocations(transferTask.SourceLocation, transferTask.DestinationLocation);
        await EnsureSourceHasAvailableStockAsync(
            transferTask.ProductId,
            transferTask.SourceLocationId,
            transferTask.Quantity,
            cancellationToken);

        transferTask.Status = TransferTaskStatus.InProgress;
        transferTask.StartedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapTransferTask(transferTask);
    }

    public async Task<TransferTaskDto> CompleteTransferTaskAsync(
        Guid transferTaskId,
        Guid performedByUserId,
        CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var transferTask = await repository.FindTransferTaskByIdAsync(transferTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Transfer task '{transferTaskId}' was not found.");

        EnsureTransferTaskStatus(
            transferTask,
            TransferTaskStatus.InProgress,
            "Only in-progress transfer tasks can be completed.");

        ValidateTransferLocations(transferTask.SourceLocation, transferTask.DestinationLocation);

        var timestamp = DateTimeOffset.UtcNow;
        var sourceBalance = await repository.FindInventoryBalanceAsync(
                transferTask.ProductId,
                transferTask.SourceLocationId,
                cancellationToken) ??
            throw new InvalidOperationException(
                $"Source location '{transferTask.SourceLocation.Code}' does not have stock for product '{transferTask.Product.Sku}'.");

        if (sourceBalance.AvailableQuantity < transferTask.Quantity)
        {
            throw new InvalidOperationException(
                $"Transfer quantity for product '{transferTask.Product.Sku}' exceeds the available stock in source location '{transferTask.SourceLocation.Code}'.");
        }

        var destinationBalance = await repository.FindInventoryBalanceAsync(
            transferTask.ProductId,
            transferTask.DestinationLocationId,
            cancellationToken);

        if (destinationBalance is null)
        {
            destinationBalance = new InventoryBalance
            {
                Id = Guid.NewGuid(),
                ProductId = transferTask.ProductId,
                Product = transferTask.Product,
                LocationId = transferTask.DestinationLocationId,
                Location = transferTask.DestinationLocation,
                OnHandQuantity = 0m,
                ReservedQuantity = 0m,
                UpdatedAtUtc = timestamp,
            };

            repository.AddInventoryBalance(destinationBalance);
        }

        sourceBalance.OnHandQuantity -= transferTask.Quantity;
        sourceBalance.UpdatedAtUtc = timestamp;

        destinationBalance.OnHandQuantity += transferTask.Quantity;
        destinationBalance.UpdatedAtUtc = timestamp;

        repository.AddInventoryMovement(new InventoryMovement
        {
            Id = Guid.NewGuid(),
            ProductId = transferTask.ProductId,
            Product = transferTask.Product,
            Quantity = transferTask.Quantity,
            MovementType = InventoryMovementType.Relocation,
            SourceLocationId = transferTask.SourceLocationId,
            SourceLocation = transferTask.SourceLocation,
            DestinationLocationId = transferTask.DestinationLocationId,
            DestinationLocation = transferTask.DestinationLocation,
            ReferenceType = "TransferTask",
            ReferenceId = transferTask.Id.ToString(),
            PerformedAtUtc = timestamp,
            PerformedByUserId = performedByUserId,
            Notes = transferTask.Reason,
        });

        transferTask.Status = TransferTaskStatus.Completed;
        transferTask.CompletedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "TransferCompleted",
            "TransferTask",
            transferTask.Id.ToString(),
            $"Completed transfer task '{transferTask.Id}' for product '{transferTask.Product.Sku}'.",
            new
            {
                statusFrom = TransferTaskStatus.InProgress,
                statusTo = TransferTaskStatus.Completed,
                productId = transferTask.ProductId,
                quantity = transferTask.Quantity,
                sourceLocationId = transferTask.SourceLocationId,
                destinationLocationId = transferTask.DestinationLocationId,
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapTransferTask(transferTask);
    }

    public async Task<TransferTaskDto> CancelTransferTaskAsync(Guid transferTaskId, CancellationToken cancellationToken)
    {
        var transferTask = await repository.FindTransferTaskByIdAsync(transferTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Transfer task '{transferTaskId}' was not found.");

        if (!string.Equals(transferTask.Status, TransferTaskStatus.Pending, StringComparison.Ordinal) &&
            !string.Equals(transferTask.Status, TransferTaskStatus.InProgress, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only pending or in-progress transfer tasks can be cancelled.");
        }

        transferTask.Status = TransferTaskStatus.Cancelled;
        transferTask.CancelledAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapTransferTask(transferTask);
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
            throw new InvalidOperationException("Transfer quantity cannot exceed the available stock in the source location.");
        }
    }

    private static TransferTaskDto MapTransferTask(TransferTask transferTask) =>
        new(
            transferTask.Id,
            transferTask.ProductId,
            transferTask.Product.Sku,
            transferTask.Product.Name,
            transferTask.SourceLocationId,
            transferTask.SourceLocation.Warehouse.Code,
            transferTask.SourceLocation.Zone.Code,
            transferTask.SourceLocation.Code,
            transferTask.SourceLocation.Name,
            transferTask.SourceLocation.LocationType,
            transferTask.SourceLocation.IsActive,
            transferTask.SourceLocation.IsBlocked,
            transferTask.DestinationLocationId,
            transferTask.DestinationLocation.Warehouse.Code,
            transferTask.DestinationLocation.Zone.Code,
            transferTask.DestinationLocation.Code,
            transferTask.DestinationLocation.Name,
            transferTask.DestinationLocation.LocationType,
            transferTask.DestinationLocation.IsActive,
            transferTask.DestinationLocation.IsBlocked,
            transferTask.Quantity,
            transferTask.Status,
            EmptyToNull(transferTask.Reason),
            transferTask.CreatedAtUtc,
            transferTask.StartedAtUtc,
            transferTask.CompletedAtUtc,
            transferTask.CancelledAtUtc);

    private static Location GetRequiredLocation(
        IReadOnlyDictionary<Guid, Location> locationsById,
        Guid locationId)
    {
        if (locationsById.TryGetValue(locationId, out var location))
        {
            return location;
        }

        throw new KeyNotFoundException($"Location '{locationId}' was not found.");
    }

    private static void ValidateTransferLocations(Location sourceLocation, Location destinationLocation)
    {
        if (sourceLocation.Id == destinationLocation.Id)
        {
            throw new InvalidOperationException("Transfer source and destination locations must be different.");
        }

        if (!sourceLocation.IsActive)
        {
            throw new InvalidOperationException(
                $"Transfer source location '{sourceLocation.Code}' must be active.");
        }

        if (!destinationLocation.IsActive)
        {
            throw new InvalidOperationException(
                $"Transfer destination location '{destinationLocation.Code}' must be active.");
        }

        if (destinationLocation.IsBlocked)
        {
            throw new InvalidOperationException(
                $"Transfer destination location '{destinationLocation.Code}' must be unblocked.");
        }

        if (string.Equals(sourceLocation.LocationType, LocationType.Receiving, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Transfer source location '{sourceLocation.Code}' cannot be of type {LocationType.Receiving}.");
        }

        if (string.Equals(destinationLocation.LocationType, LocationType.Receiving, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Transfer destination location '{destinationLocation.Code}' cannot be of type {LocationType.Receiving}.");
        }
    }

    private static void EnsureTransferTaskStatus(TransferTask transferTask, string expectedStatus, string message)
    {
        if (!string.Equals(transferTask.Status, expectedStatus, StringComparison.Ordinal))
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
}
