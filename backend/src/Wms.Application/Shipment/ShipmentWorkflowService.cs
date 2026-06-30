using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Shipment.Abstractions;
using Wms.Application.Shipment.Models;
using Wms.Domain.Inventory;
using Wms.Domain.Picking;
using Wms.Domain.Sales;
using ShipmentEntity = Wms.Domain.Shipment.Shipment;
using ShipmentLineEntity = Wms.Domain.Shipment.ShipmentLine;
using Wms.Domain.Shipment;

namespace Wms.Application.Shipment;

public sealed class ShipmentWorkflowService(IShipmentWorkflowRepository repository, IAuditLogWriter? auditLogWriter = null)
{
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<ShipmentDto>> ListShipmentsAsync(CancellationToken cancellationToken)
    {
        var shipments = await repository.ListShipmentsAsync(cancellationToken);
        return shipments
            .Select(MapShipment)
            .ToArray();
    }

    public async Task<ShipmentDto?> GetShipmentByIdAsync(Guid shipmentId, CancellationToken cancellationToken)
    {
        var shipment = await repository.FindShipmentByIdAsync(shipmentId, cancellationToken);
        return shipment is null ? null : MapShipment(shipment);
    }

    public async Task<ShipmentDto> CreateShipmentAsync(
        CreateShipmentCommand command,
        CancellationToken cancellationToken)
    {
        var lineCommands = NormalizeLines(command.Lines);
        var salesOrder = await repository.FindSalesOrderByIdAsync(command.SalesOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Sales order '{command.SalesOrderId}' was not found.");

        EnsureSalesOrderCanCreateShipment(salesOrder);

        var pickingTaskLinesById = await repository.FindPickingTaskLinesByIdsAsync(
            lineCommands.Select(line => line.PickingTaskLineId).ToArray(),
            cancellationToken);

        var openAllocatedQuantities = await repository.ListOpenAllocatedQuantitiesByPickingTaskLineIdsAsync(
            lineCommands.Select(line => line.PickingTaskLineId).ToArray(),
            excludedShipmentId: null,
            cancellationToken);

        var completedShippedQuantities = await repository.ListCompletedShippedQuantitiesByPickingTaskLineIdsAsync(
            lineCommands.Select(line => line.PickingTaskLineId).ToArray(),
            excludedShipmentId: null,
            cancellationToken);

        var shipment = new ShipmentEntity
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrder.Id,
            SalesOrder = salesOrder,
            Status = ShipmentStatus.Pending,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        foreach (var lineCommand in lineCommands)
        {
            if (!pickingTaskLinesById.TryGetValue(lineCommand.PickingTaskLineId, out var pickingTaskLine))
            {
                throw new KeyNotFoundException($"Picking task line '{lineCommand.PickingTaskLineId}' was not found.");
            }

            ValidatePickingTaskLineForShipment(salesOrder, pickingTaskLine, lineCommand.QuantityToShip);

            var openAllocatedQuantity = openAllocatedQuantities.GetValueOrDefault(pickingTaskLine.Id);
            var completedShippedQuantity = completedShippedQuantities.GetValueOrDefault(pickingTaskLine.Id);
            var remainingShippableQuantity = pickingTaskLine.PickedQuantity - openAllocatedQuantity - completedShippedQuantity;

            if (remainingShippableQuantity < lineCommand.QuantityToShip)
            {
                throw new InvalidOperationException(
                    $"Shipment quantity for picking task line '{pickingTaskLine.Id}' exceeds the remaining picked quantity available for new shipments.");
            }

            shipment.Lines.Add(new ShipmentLineEntity
            {
                Id = Guid.NewGuid(),
                ShipmentId = shipment.Id,
                Shipment = shipment,
                PickingTaskLineId = pickingTaskLine.Id,
                PickingTaskLine = pickingTaskLine,
                QuantityToShip = lineCommand.QuantityToShip,
                ShippedQuantity = 0m,
            });
        }

        repository.AddShipment(shipment);
        await repository.SaveChangesAsync(cancellationToken);

        return MapShipment(shipment);
    }

    public async Task<ShipmentDto> StartShipmentAsync(Guid shipmentId, CancellationToken cancellationToken)
    {
        var shipment = await repository.FindShipmentByIdAsync(shipmentId, cancellationToken)
            ?? throw new KeyNotFoundException($"Shipment '{shipmentId}' was not found.");

        EnsureShipmentStatus(
            shipment,
            ShipmentStatus.Pending,
            "Only pending shipments can be started.");

        EnsureShipmentHasLines(shipment);
        await EnsureShipmentLinesRemainShippableAsync(shipment, cancellationToken);

        shipment.Status = ShipmentStatus.InProgress;
        shipment.StartedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapShipment(shipment);
    }

    public async Task<ShipmentDto> CompleteShipmentAsync(
        Guid shipmentId,
        Guid performedByUserId,
        CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var shipment = await repository.FindShipmentByIdAsync(shipmentId, cancellationToken)
            ?? throw new KeyNotFoundException($"Shipment '{shipmentId}' was not found.");

        EnsureShipmentStatus(
            shipment,
            ShipmentStatus.InProgress,
            "Only in-progress shipments can be completed.");

        EnsureShipmentHasLines(shipment);

        var completedShippedQuantities = await repository.ListCompletedShippedQuantitiesByPickingTaskLineIdsAsync(
            shipment.Lines.Select(line => line.PickingTaskLineId).ToArray(),
            shipment.Id,
            cancellationToken);

        var timestamp = DateTimeOffset.UtcNow;

        foreach (var line in shipment.Lines)
        {
            ValidatePositiveQuantity(line.QuantityToShip, nameof(line.QuantityToShip));

            var pickingTaskLine = line.PickingTaskLine;
            ValidatePickingTaskLineForShipment(shipment.SalesOrder, pickingTaskLine, line.QuantityToShip);

            var completedShippedQuantity = completedShippedQuantities.GetValueOrDefault(pickingTaskLine.Id);
            var remainingShippableQuantity = pickingTaskLine.PickedQuantity - completedShippedQuantity;

            if (remainingShippableQuantity < line.QuantityToShip)
            {
                throw new InvalidOperationException(
                    $"Shipment line '{line.Id}' exceeds the remaining picked quantity available for shipment from picking task line '{pickingTaskLine.Id}'.");
            }

            var reservation = pickingTaskLine.SalesOrderReservation;
            var salesOrderLine = pickingTaskLine.SalesOrderLine;
            var inventoryBalance = pickingTaskLine.InventoryBalance;

            if (reservation.PickedQuantity < line.QuantityToShip)
            {
                throw new InvalidOperationException(
                    $"Shipment line '{line.Id}' cannot ship more than the currently picked quantity on reservation '{reservation.Id}'.");
            }

            if (salesOrderLine.PickedQuantity < line.QuantityToShip)
            {
                throw new InvalidOperationException(
                    $"Shipment line '{line.Id}' cannot ship more than the currently picked quantity on sales order line '{salesOrderLine.Id}'.");
            }

            if (inventoryBalance.PickedQuantity < line.QuantityToShip)
            {
                throw new InvalidOperationException(
                    $"Shipment line '{line.Id}' cannot ship more than the currently picked quantity on inventory balance '{inventoryBalance.Id}'.");
            }

            if (inventoryBalance.OnHandQuantity < line.QuantityToShip)
            {
                throw new InvalidOperationException(
                    $"Shipment line '{line.Id}' cannot ship more than the current on-hand quantity on inventory balance '{inventoryBalance.Id}'.");
            }

            reservation.PickedQuantity -= line.QuantityToShip;
            salesOrderLine.PickedQuantity -= line.QuantityToShip;
            inventoryBalance.PickedQuantity -= line.QuantityToShip;
            inventoryBalance.OnHandQuantity -= line.QuantityToShip;
            inventoryBalance.UpdatedAtUtc = timestamp;
            line.ShippedQuantity = line.QuantityToShip;

            repository.AddInventoryMovement(new InventoryMovement
            {
                Id = Guid.NewGuid(),
                ProductId = salesOrderLine.ProductId,
                Product = salesOrderLine.Product,
                Quantity = line.QuantityToShip,
                MovementType = InventoryMovementType.Removal,
                SourceLocationId = inventoryBalance.LocationId,
                SourceLocation = inventoryBalance.Location,
                DestinationLocationId = null,
                DestinationLocation = null,
                ReferenceType = "Shipment",
                ReferenceId = shipment.Id.ToString(),
                PerformedAtUtc = timestamp,
                PerformedByUserId = performedByUserId,
            });
        }

        shipment.SalesOrder.UpdatedAtUtc = timestamp;
        shipment.Status = ShipmentStatus.Completed;
        shipment.CompletedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "ShipmentCompleted",
            "Shipment",
            shipment.Id.ToString(),
            $"Completed shipment '{shipment.Id}' for sales order '{shipment.SalesOrderId}'.",
            new
            {
                statusFrom = ShipmentStatus.InProgress,
                statusTo = ShipmentStatus.Completed,
                salesOrderId = shipment.SalesOrderId,
                lineCount = shipment.Lines.Count,
                totalShippedQuantity = shipment.Lines.Sum(line => line.ShippedQuantity),
                pickingTaskIds = shipment.Lines.Select(line => line.PickingTaskLine.PickingTaskId).Distinct().ToArray(),
                sourceLocationIds = shipment.Lines.Select(line => line.PickingTaskLine.InventoryBalance.LocationId).Distinct().ToArray(),
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapShipment(shipment);
    }

    public async Task<ShipmentDto> CancelShipmentAsync(Guid shipmentId, CancellationToken cancellationToken)
    {
        var shipment = await repository.FindShipmentByIdAsync(shipmentId, cancellationToken)
            ?? throw new KeyNotFoundException($"Shipment '{shipmentId}' was not found.");

        if (!string.Equals(shipment.Status, ShipmentStatus.Pending, StringComparison.Ordinal) &&
            !string.Equals(shipment.Status, ShipmentStatus.InProgress, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only pending or in-progress shipments can be cancelled.");
        }

        shipment.Status = ShipmentStatus.Cancelled;
        shipment.CancelledAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapShipment(shipment);
    }

    private async Task EnsureShipmentLinesRemainShippableAsync(
        ShipmentEntity shipment,
        CancellationToken cancellationToken)
    {
        var openAllocatedQuantities = await repository.ListOpenAllocatedQuantitiesByPickingTaskLineIdsAsync(
            shipment.Lines.Select(line => line.PickingTaskLineId).ToArray(),
            shipment.Id,
            cancellationToken);

        var completedShippedQuantities = await repository.ListCompletedShippedQuantitiesByPickingTaskLineIdsAsync(
            shipment.Lines.Select(line => line.PickingTaskLineId).ToArray(),
            shipment.Id,
            cancellationToken);

        foreach (var line in shipment.Lines)
        {
            ValidatePickingTaskLineForShipment(shipment.SalesOrder, line.PickingTaskLine, line.QuantityToShip);

            var openAllocatedQuantity = openAllocatedQuantities.GetValueOrDefault(line.PickingTaskLineId);
            var completedShippedQuantity = completedShippedQuantities.GetValueOrDefault(line.PickingTaskLineId);
            var remainingShippableQuantity =
                line.PickingTaskLine.PickedQuantity - openAllocatedQuantity - completedShippedQuantity;

            if (remainingShippableQuantity < line.QuantityToShip)
            {
                throw new InvalidOperationException(
                    $"Shipment line '{line.Id}' exceeds the remaining picked quantity available for execution.");
            }
        }
    }

    private static ShipmentDto MapShipment(ShipmentEntity shipment) =>
        new(
            shipment.Id,
            shipment.SalesOrderId,
            shipment.SalesOrder.Status,
            shipment.Status,
            shipment.CreatedAtUtc,
            shipment.StartedAtUtc,
            shipment.CompletedAtUtc,
            shipment.CancelledAtUtc,
            shipment.Lines
                .OrderBy(line => line.PickingTaskLine.SalesOrderLine.Product.Sku, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.PickingTaskLine.InventoryBalance.Location.Warehouse.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.PickingTaskLine.InventoryBalance.Location.Zone.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.PickingTaskLine.InventoryBalance.Location.Code, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.Id)
                .Select(line => new ShipmentLineDto(
                    line.Id,
                    line.PickingTaskLineId,
                    line.PickingTaskLine.PickingTaskId,
                    line.PickingTaskLine.SalesOrderLineId,
                    line.PickingTaskLine.SalesOrderReservationId,
                    line.PickingTaskLine.InventoryBalanceId,
                    line.PickingTaskLine.SalesOrderLine.ProductId,
                    line.PickingTaskLine.SalesOrderLine.Product.Sku,
                    line.PickingTaskLine.SalesOrderLine.Product.Name,
                    line.PickingTaskLine.InventoryBalance.LocationId,
                    line.PickingTaskLine.InventoryBalance.Location.Warehouse.Code,
                    line.PickingTaskLine.InventoryBalance.Location.Zone.Code,
                    line.PickingTaskLine.InventoryBalance.Location.Code,
                    line.PickingTaskLine.InventoryBalance.Location.Name,
                    line.PickingTaskLine.InventoryBalance.Location.LocationType,
                    line.PickingTaskLine.InventoryBalance.Location.IsActive,
                    line.PickingTaskLine.InventoryBalance.Location.IsBlocked,
                    line.QuantityToShip,
                    line.ShippedQuantity))
                .ToArray());

    private static CreateShipmentLineCommand[] NormalizeLines(
        IReadOnlyCollection<CreateShipmentLineCommand>? lines)
    {
        EnsureHasLines(lines, "Shipment");
        var normalizedLines = lines!
            .Select(line => line with
            {
                QuantityToShip = decimal.Round(line.QuantityToShip, 2, MidpointRounding.AwayFromZero),
            })
            .ToArray();

        var duplicatePickingTaskLineId = normalizedLines
            .GroupBy(line => line.PickingTaskLineId)
            .Where(group => group.Count() > 1)
            .Select(group => (Guid?)group.Key)
            .FirstOrDefault();

        if (duplicatePickingTaskLineId.HasValue)
        {
            throw new ArgumentException(
                $"Shipment lines must reference each picking task line only once. Duplicate picking task line '{duplicatePickingTaskLineId.Value}' was provided.",
                nameof(lines));
        }

        foreach (var line in normalizedLines)
        {
            ValidatePositiveQuantity(line.QuantityToShip, nameof(line.QuantityToShip));
        }

        return normalizedLines;
    }

    private static void EnsureSalesOrderCanCreateShipment(SalesOrder salesOrder)
    {
        if (string.Equals(salesOrder.Status, SalesOrderStatus.Cancelled, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Cancelled sales orders cannot create shipments.");
        }
    }

    private static void ValidatePickingTaskLineForShipment(
        SalesOrder salesOrder,
        PickingTaskLine pickingTaskLine,
        decimal quantityToShip)
    {
        if (pickingTaskLine.PickingTask.SalesOrderId != salesOrder.Id)
        {
            throw new InvalidOperationException(
                $"Picking task line '{pickingTaskLine.Id}' does not belong to sales order '{salesOrder.Id}'.");
        }

        if (!string.Equals(pickingTaskLine.PickingTask.Status, PickingTaskStatus.Completed, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Picking task line '{pickingTaskLine.Id}' can be shipped only after its picking task is completed.");
        }

        if (pickingTaskLine.PickedQuantity <= 0m)
        {
            throw new InvalidOperationException(
                $"Picking task line '{pickingTaskLine.Id}' does not have picked quantity available for shipment.");
        }

        if (pickingTaskLine.InventoryBalance.PickedQuantity < quantityToShip)
        {
            throw new InvalidOperationException(
                $"Picking task line '{pickingTaskLine.Id}' cannot ship more than the currently picked quantity on inventory balance '{pickingTaskLine.InventoryBalanceId}'.");
        }
    }

    private static void EnsureShipmentStatus(ShipmentEntity shipment, string expectedStatus, string message)
    {
        if (!string.Equals(shipment.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static void EnsureShipmentHasLines(ShipmentEntity shipment) =>
        EnsureHasLines(shipment.Lines, "Shipment");

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
