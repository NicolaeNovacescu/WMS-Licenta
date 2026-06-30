using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Picking.Abstractions;
using Wms.Application.Picking.Models;
using Wms.Domain.Picking;
using Wms.Domain.Sales;

namespace Wms.Application.Picking;

public sealed class PickingWorkflowService(IPickingWorkflowRepository repository, IAuditLogWriter? auditLogWriter = null)
{
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<PickingTaskDto>> ListPickingTasksAsync(CancellationToken cancellationToken)
    {
        var pickingTasks = await repository.ListPickingTasksAsync(cancellationToken);
        return pickingTasks
            .Select(MapPickingTask)
            .ToArray();
    }

    public async Task<PickingTaskDto?> GetPickingTaskByIdAsync(Guid pickingTaskId, CancellationToken cancellationToken)
    {
        var pickingTask = await repository.FindPickingTaskByIdAsync(pickingTaskId, cancellationToken);
        return pickingTask is null ? null : MapPickingTask(pickingTask);
    }

    public async Task<PickingTaskDto> CreatePickingTaskAsync(
        CreatePickingTaskCommand command,
        CancellationToken cancellationToken)
    {
        var lineCommands = NormalizeLines(command.Lines);
        var salesOrder = await repository.FindSalesOrderByIdAsync(command.SalesOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Sales order '{command.SalesOrderId}' was not found.");

        EnsureSalesOrderCanCreatePickingTask(salesOrder);

        var reservationsById = salesOrder.Lines
            .SelectMany(line => line.Reservations)
            .ToDictionary(reservation => reservation.Id);

        var openAllocatedQuantities = await repository.ListOpenAllocatedQuantitiesByReservationIdsAsync(
            lineCommands.Select(line => line.SalesOrderReservationId).ToArray(),
            excludedPickingTaskId: null,
            cancellationToken);

        var pickingTask = new PickingTask
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = PickingTaskStatus.Pending,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        foreach (var lineCommand in lineCommands)
        {
            if (!reservationsById.TryGetValue(lineCommand.SalesOrderReservationId, out var reservation))
            {
                throw new InvalidOperationException(
                    $"Sales order '{salesOrder.Id}' does not contain reservation '{lineCommand.SalesOrderReservationId}'.");
            }

            ValidateReservationForPicking(reservation, lineCommand.QuantityToPick);

            var openAllocatedQuantity = openAllocatedQuantities.GetValueOrDefault(reservation.Id);
            var availableToAllocate = reservation.Quantity - openAllocatedQuantity;

            if (availableToAllocate < lineCommand.QuantityToPick)
            {
                throw new InvalidOperationException(
                    $"Picking quantity for reservation '{reservation.Id}' exceeds the remaining reserved quantity available for new tasks.");
            }

            var salesOrderLine = reservation.SalesOrderLine;
            var inventoryBalance = reservation.InventoryBalance;

            pickingTask.Lines.Add(new PickingTaskLine
            {
                Id = Guid.NewGuid(),
                PickingTaskId = pickingTask.Id,
                PickingTask = pickingTask,
                SalesOrderLineId = salesOrderLine.Id,
                SalesOrderLine = salesOrderLine,
                SalesOrderReservationId = reservation.Id,
                SalesOrderReservation = reservation,
                InventoryBalanceId = inventoryBalance.Id,
                InventoryBalance = inventoryBalance,
                QuantityToPick = lineCommand.QuantityToPick,
                PickedQuantity = 0m,
            });
        }

        repository.AddPickingTask(pickingTask);
        await repository.SaveChangesAsync(cancellationToken);

        return MapPickingTask(pickingTask);
    }

    public async Task<PickingTaskDto> StartPickingTaskAsync(Guid pickingTaskId, CancellationToken cancellationToken)
    {
        var pickingTask = await repository.FindPickingTaskByIdAsync(pickingTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Picking task '{pickingTaskId}' was not found.");

        EnsurePickingTaskStatus(
            pickingTask,
            PickingTaskStatus.Pending,
            "Only pending picking tasks can be started.");

        EnsurePickingTaskHasLines(pickingTask);
        await EnsureTaskLinesRemainAssignableAsync(pickingTask, cancellationToken);

        pickingTask.Status = PickingTaskStatus.InProgress;
        pickingTask.StartedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapPickingTask(pickingTask);
    }

    public async Task<PickingTaskDto> CompletePickingTaskAsync(Guid pickingTaskId, CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var pickingTask = await repository.FindPickingTaskByIdAsync(pickingTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Picking task '{pickingTaskId}' was not found.");

        EnsurePickingTaskStatus(
            pickingTask,
            PickingTaskStatus.InProgress,
            "Only in-progress picking tasks can be completed.");

        EnsurePickingTaskHasLines(pickingTask);

        var timestamp = DateTimeOffset.UtcNow;

        foreach (var line in pickingTask.Lines)
        {
            ValidatePositiveQuantity(line.QuantityToPick, nameof(line.QuantityToPick));

            var reservation = line.SalesOrderReservation;
            var salesOrderLine = line.SalesOrderLine;
            var inventoryBalance = line.InventoryBalance;

            if (reservation.Quantity < line.QuantityToPick)
            {
                throw new InvalidOperationException(
                    $"Picking line '{line.Id}' cannot pick more than the remaining reserved quantity on reservation '{reservation.Id}'.");
            }

            if (salesOrderLine.ReservedQuantity < line.QuantityToPick)
            {
                throw new InvalidOperationException(
                    $"Sales order line '{salesOrderLine.Id}' cannot pick more than its remaining reserved quantity.");
            }

            if (inventoryBalance.ReservedQuantity < line.QuantityToPick)
            {
                throw new InvalidOperationException(
                    $"Inventory balance '{inventoryBalance.Id}' cannot pick more than its current reserved quantity.");
            }

            reservation.Quantity -= line.QuantityToPick;
            reservation.PickedQuantity += line.QuantityToPick;

            salesOrderLine.ReservedQuantity -= line.QuantityToPick;
            salesOrderLine.PickedQuantity += line.QuantityToPick;

            inventoryBalance.ReservedQuantity -= line.QuantityToPick;
            inventoryBalance.PickedQuantity += line.QuantityToPick;
            inventoryBalance.UpdatedAtUtc = timestamp;

            line.PickedQuantity = line.QuantityToPick;
        }

        pickingTask.SalesOrder.Status = DeriveSalesOrderStatus(pickingTask.SalesOrder);
        pickingTask.SalesOrder.UpdatedAtUtc = timestamp;
        pickingTask.Status = PickingTaskStatus.Completed;
        pickingTask.CompletedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "PickingCompleted",
            "PickingTask",
            pickingTask.Id.ToString(),
            $"Completed picking task '{pickingTask.Id}' for sales order '{pickingTask.SalesOrderId}'.",
            new
            {
                statusFrom = PickingTaskStatus.InProgress,
                statusTo = PickingTaskStatus.Completed,
                salesOrderId = pickingTask.SalesOrderId,
                lineCount = pickingTask.Lines.Count,
                totalPickedQuantity = pickingTask.Lines.Sum(line => line.PickedQuantity),
                reservationIds = pickingTask.Lines.Select(line => line.SalesOrderReservationId).Distinct().ToArray(),
                inventoryBalanceIds = pickingTask.Lines.Select(line => line.InventoryBalanceId).Distinct().ToArray(),
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapPickingTask(pickingTask);
    }

    public async Task<PickingTaskDto> CancelPickingTaskAsync(Guid pickingTaskId, CancellationToken cancellationToken)
    {
        var pickingTask = await repository.FindPickingTaskByIdAsync(pickingTaskId, cancellationToken)
            ?? throw new KeyNotFoundException($"Picking task '{pickingTaskId}' was not found.");

        if (!string.Equals(pickingTask.Status, PickingTaskStatus.Pending, StringComparison.Ordinal) &&
            !string.Equals(pickingTask.Status, PickingTaskStatus.InProgress, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only pending or in-progress picking tasks can be cancelled.");
        }

        pickingTask.Status = PickingTaskStatus.Cancelled;
        pickingTask.CancelledAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapPickingTask(pickingTask);
    }

    private async Task EnsureTaskLinesRemainAssignableAsync(
        PickingTask pickingTask,
        CancellationToken cancellationToken)
    {
        var openAllocatedQuantities = await repository.ListOpenAllocatedQuantitiesByReservationIdsAsync(
            pickingTask.Lines.Select(line => line.SalesOrderReservationId).ToArray(),
            pickingTask.Id,
            cancellationToken);

        foreach (var line in pickingTask.Lines)
        {
            ValidateReservationForPicking(line.SalesOrderReservation, line.QuantityToPick);

            var openAllocatedQuantity = openAllocatedQuantities.GetValueOrDefault(line.SalesOrderReservationId);
            var availableToAllocate = line.SalesOrderReservation.Quantity - openAllocatedQuantity;

            if (availableToAllocate < line.QuantityToPick)
            {
                throw new InvalidOperationException(
                    $"Picking line '{line.Id}' exceeds the remaining reserved quantity available for execution.");
            }
        }
    }

    private static PickingTaskDto MapPickingTask(PickingTask pickingTask) =>
        new(
            pickingTask.Id,
            pickingTask.SalesOrderId,
            pickingTask.SalesOrder.Status,
            pickingTask.Status,
            pickingTask.CreatedAtUtc,
            pickingTask.StartedAtUtc,
            pickingTask.CompletedAtUtc,
            pickingTask.CancelledAtUtc,
            pickingTask.Lines
                .OrderBy(line => line.SalesOrderLine.Product.Sku, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.SalesOrderReservation.InventoryBalance.Location.Warehouse.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.SalesOrderReservation.InventoryBalance.Location.Zone.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.SalesOrderReservation.InventoryBalance.Location.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.Id)
                .Select(line => new PickingTaskLineDto(
                    line.Id,
                    line.SalesOrderLineId,
                    line.SalesOrderReservationId,
                    line.InventoryBalanceId,
                    line.SalesOrderLine.ProductId,
                    line.SalesOrderLine.Product.Sku,
                    line.SalesOrderLine.Product.Name,
                    line.InventoryBalance.LocationId,
                    line.InventoryBalance.Location.Warehouse.Code,
                    line.InventoryBalance.Location.Zone.Code,
                    line.InventoryBalance.Location.Code,
                    line.InventoryBalance.Location.Name,
                    line.InventoryBalance.Location.LocationType,
                    line.InventoryBalance.Location.IsActive,
                    line.InventoryBalance.Location.IsBlocked,
                    line.QuantityToPick,
                    line.PickedQuantity))
                .ToArray());

    private static CreatePickingTaskLineCommand[] NormalizeLines(
        IReadOnlyCollection<CreatePickingTaskLineCommand>? lines)
    {
        EnsureHasLines(lines, "Picking task");
        var normalizedLines = lines!
            .Select(line => line with
            {
                QuantityToPick = decimal.Round(line.QuantityToPick, 2, MidpointRounding.AwayFromZero),
            })
            .ToArray();

        var duplicateReservationId = normalizedLines
            .GroupBy(line => line.SalesOrderReservationId)
            .Where(group => group.Count() > 1)
            .Select(group => (Guid?)group.Key)
            .FirstOrDefault();

        if (duplicateReservationId.HasValue)
        {
            throw new ArgumentException(
                $"Picking task lines must reference each reservation only once. Duplicate reservation '{duplicateReservationId.Value}' was provided.",
                nameof(lines));
        }

        foreach (var line in normalizedLines)
        {
            ValidatePositiveQuantity(line.QuantityToPick, nameof(line.QuantityToPick));
        }

        return normalizedLines;
    }

    private static void EnsureSalesOrderCanCreatePickingTask(SalesOrder salesOrder)
    {
        if (string.Equals(salesOrder.Status, SalesOrderStatus.Cancelled, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Cancelled sales orders cannot create picking tasks.");
        }
    }

    private static void ValidateReservationForPicking(SalesOrderReservation reservation, decimal quantityToPick)
    {
        if (reservation.Quantity <= 0m)
        {
            throw new InvalidOperationException(
                $"Reservation '{reservation.Id}' does not have remaining reserved quantity available for picking.");
        }

        if (reservation.InventoryBalance.ReservedQuantity < quantityToPick)
        {
            throw new InvalidOperationException(
                $"Reservation '{reservation.Id}' cannot pick more than the reserved quantity currently held on inventory balance '{reservation.InventoryBalanceId}'.");
        }
    }

    private static string DeriveSalesOrderStatus(SalesOrder salesOrder)
    {
        var totalOrderedQuantity = salesOrder.Lines.Sum(line => line.OrderedQuantity);
        var totalCommittedQuantity = salesOrder.Lines.Sum(line => line.ReservedQuantity + line.PickedQuantity);

        if (totalCommittedQuantity <= 0m)
        {
            return SalesOrderStatus.Confirmed;
        }

        return totalCommittedQuantity >= totalOrderedQuantity
            ? SalesOrderStatus.FullyReserved
            : SalesOrderStatus.PartiallyReserved;
    }

    private static void EnsurePickingTaskStatus(PickingTask pickingTask, string expectedStatus, string message)
    {
        if (!string.Equals(pickingTask.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static void EnsurePickingTaskHasLines(PickingTask pickingTask) =>
        EnsureHasLines(pickingTask.Lines, "Picking task");

    private static void EnsureHasLines<T>(IEnumerable<T>? lines, string entityName)
    {
        if (lines is null || !lines.Any())
        {
            throw new ArgumentException($"{entityName} must include at least one line.", nameof(lines));
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
