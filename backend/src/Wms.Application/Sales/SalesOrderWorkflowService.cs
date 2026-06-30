using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Sales.Abstractions;
using Wms.Application.Sales.Models;
using Wms.Domain.Catalog;
using Wms.Domain.Inventory;
using Wms.Domain.Sales;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Sales;

public sealed class SalesOrderWorkflowService(ISalesOrderWorkflowRepository repository, IAuditLogWriter? auditLogWriter = null)
{
    private const string PickingTaskLineReservationReferenceMessage =
        "Sales orders with picking task history cannot change reservation state because picking task lines still reference current reservations.";

    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<SalesOrderDto>> ListSalesOrdersAsync(CancellationToken cancellationToken)
    {
        var salesOrders = await repository.ListSalesOrdersAsync(cancellationToken);
        return salesOrders
            .Select(MapSalesOrder)
            .ToArray();
    }

    public async Task<SalesOrderDto?> GetSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken)
    {
        var salesOrder = await repository.FindSalesOrderByIdAsync(salesOrderId, cancellationToken);
        return salesOrder is null ? null : MapSalesOrder(salesOrder);
    }

    public async Task<SalesOrderDto> CreateSalesOrderAsync(
        CreateSalesOrderCommand command,
        CancellationToken cancellationToken)
    {
        var customer = await GetRequiredActiveCustomerAsync(command.CustomerId, cancellationToken);
        var lineCommands = NormalizeLines(command.Lines);
        var productsById = await GetRequiredProductsAsync(lineCommands, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        var salesOrder = new SalesOrder
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            Customer = customer,
            Status = SalesOrderStatus.Draft,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        foreach (var lineCommand in lineCommands)
        {
            var product = productsById[lineCommand.ProductId];

            salesOrder.Lines.Add(new SalesOrderLine
            {
                Id = Guid.NewGuid(),
                SalesOrderId = salesOrder.Id,
                SalesOrder = salesOrder,
                ProductId = product.Id,
                Product = product,
                OrderedQuantity = lineCommand.OrderedQuantity,
                ReservedQuantity = 0m,
                PickedQuantity = 0m,
            });
        }

        repository.AddSalesOrder(salesOrder);
        await repository.SaveChangesAsync(cancellationToken);

        return MapSalesOrder(salesOrder);
    }

    public async Task<SalesOrderDto> UpdateSalesOrderAsync(
        Guid salesOrderId,
        UpdateSalesOrderCommand command,
        CancellationToken cancellationToken)
    {
        var salesOrder = await repository.FindSalesOrderByIdAsync(salesOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Sales order '{salesOrderId}' was not found.");

        EnsureSalesOrderStatus(
            salesOrder,
            SalesOrderStatus.Draft,
            "Only draft sales orders can be updated.");

        var customer = await GetRequiredActiveCustomerAsync(command.CustomerId, cancellationToken);
        var lineCommands = NormalizeLines(command.Lines);
        var productsById = await GetRequiredProductsAsync(lineCommands, cancellationToken);
        var existingLines = salesOrder.Lines.ToArray();

        repository.RemoveSalesOrderLines(existingLines);
        salesOrder.Lines.Clear();

        salesOrder.CustomerId = customer.Id;
        salesOrder.Customer = customer;
        salesOrder.UpdatedAtUtc = DateTimeOffset.UtcNow;

        foreach (var lineCommand in lineCommands)
        {
            var product = productsById[lineCommand.ProductId];

            salesOrder.Lines.Add(new SalesOrderLine
            {
                Id = Guid.NewGuid(),
                SalesOrderId = salesOrder.Id,
                SalesOrder = salesOrder,
                ProductId = product.Id,
                Product = product,
                OrderedQuantity = lineCommand.OrderedQuantity,
                ReservedQuantity = 0m,
                PickedQuantity = 0m,
            });
        }

        await repository.SaveChangesAsync(cancellationToken);

        return MapSalesOrder(salesOrder);
    }

    public async Task<SalesOrderDto> ConfirmSalesOrderAsync(Guid salesOrderId, CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var salesOrder = await repository.FindSalesOrderByIdAsync(salesOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Sales order '{salesOrderId}' was not found.");

        var previousStatus = salesOrder.Status;
        await EnsureSalesOrderHasNoShipmentExecutionAsync(salesOrder.Id, cancellationToken);
        EnsureSalesOrderCanConfirm(salesOrder);
        await EnsureSalesOrderHasNoOpenPickingTasksAsync(salesOrder.Id, cancellationToken);
        EnsureHasLines(salesOrder.Lines, "Sales order");
        await EnsureSalesOrderReservationsHaveNoPickingTaskLineReferencesAsync(salesOrder, cancellationToken);

        var timestamp = DateTimeOffset.UtcNow;
        var releasedReservations = ReleaseReservations(salesOrder, timestamp);
        if (releasedReservations)
        {
            await repository.SaveChangesAsync(cancellationToken);
        }

        var productIds = salesOrder.Lines
            .Select(line => line.ProductId)
            .Distinct()
            .ToArray();

        var reservationCandidates = await repository.ListEligibleReservationBalancesAsync(productIds, cancellationToken);
        var candidatesByProductId = reservationCandidates
            .GroupBy(balance => balance.ProductId)
            .ToDictionary(group => group.Key, group => OrderReservationCandidates(group).ToArray());
        var newReservations = new List<SalesOrderReservation>();

        foreach (var line in salesOrder.Lines
                     .OrderBy(line => line.Product.Sku, StringComparer.OrdinalIgnoreCase)
                     .ThenBy(line => line.Id))
        {
            line.ReservedQuantity = 0m;
            line.PickedQuantity = 0m;
            var remainingQuantity = line.OrderedQuantity;

            if (!candidatesByProductId.TryGetValue(line.ProductId, out var candidateBalances))
            {
                continue;
            }

            foreach (var candidateBalance in candidateBalances)
            {
                if (remainingQuantity <= 0m)
                {
                    break;
                }

                var reservableQuantity = decimal.Min(candidateBalance.AvailableQuantity, remainingQuantity);
                if (reservableQuantity <= 0m)
                {
                    continue;
                }

                var roundedQuantity = decimal.Round(reservableQuantity, 2, MidpointRounding.AwayFromZero);
                if (roundedQuantity <= 0m)
                {
                    continue;
                }

                var reservation = new SalesOrderReservation
                {
                    Id = Guid.NewGuid(),
                    SalesOrderLineId = line.Id,
                    SalesOrderLine = line,
                    InventoryBalanceId = candidateBalance.Id,
                    InventoryBalance = candidateBalance,
                    Quantity = roundedQuantity,
                    PickedQuantity = 0m,
                    CreatedAtUtc = timestamp,
                };

                candidateBalance.ReservedQuantity += roundedQuantity;
                candidateBalance.UpdatedAtUtc = timestamp;
                line.ReservedQuantity += roundedQuantity;
                line.Reservations.Add(reservation);
                newReservations.Add(reservation);
                remainingQuantity -= roundedQuantity;
            }
        }

        if (newReservations.Count > 0)
        {
            repository.AddSalesOrderReservations(newReservations);
        }

        salesOrder.Status = DeriveSalesOrderStatus(salesOrder);
        salesOrder.ConfirmedAtUtc = timestamp;
        salesOrder.UpdatedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "SalesOrderConfirmed",
            "SalesOrder",
            salesOrder.Id.ToString(),
            $"Confirmed sales order '{salesOrder.Id}' and applied reservation attempt.",
            new
            {
                statusFrom = previousStatus,
                statusTo = salesOrder.Status,
                lineCount = salesOrder.Lines.Count,
                totalOrderedQuantity = salesOrder.Lines.Sum(line => line.OrderedQuantity),
                totalReservedQuantity = salesOrder.Lines.Sum(line => line.ReservedQuantity),
                totalPickedQuantity = salesOrder.Lines.Sum(line => line.PickedQuantity),
                productIds = salesOrder.Lines.Select(line => line.ProductId).Distinct().ToArray(),
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapSalesOrder(salesOrder);
    }

    public async Task<SalesOrderDto> CancelSalesOrderAsync(Guid salesOrderId, CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var salesOrder = await repository.FindSalesOrderByIdAsync(salesOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Sales order '{salesOrderId}' was not found.");

        if (string.Equals(salesOrder.Status, SalesOrderStatus.Cancelled, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Cancelled sales orders cannot be changed.");
        }

        var previousStatus = salesOrder.Status;
        var releasedReservedQuantity = salesOrder.Lines.Sum(line => line.ReservedQuantity);
        await EnsureSalesOrderHasNoShipmentExecutionAsync(salesOrder.Id, cancellationToken);
        EnsureSalesOrderHasNoPickedQuantity(salesOrder, "Sales orders with picked quantity cannot be cancelled.");
        await EnsureSalesOrderHasNoOpenPickingTasksAsync(salesOrder.Id, cancellationToken);

        var timestamp = DateTimeOffset.UtcNow;
        ReleaseReservations(salesOrder, timestamp);

        salesOrder.Status = SalesOrderStatus.Cancelled;
        salesOrder.CancelledAtUtc = timestamp;
        salesOrder.UpdatedAtUtc = timestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "SalesOrderCancelled",
            "SalesOrder",
            salesOrder.Id.ToString(),
            $"Cancelled sales order '{salesOrder.Id}' and released its reservations.",
            new
            {
                statusFrom = previousStatus,
                statusTo = SalesOrderStatus.Cancelled,
                lineCount = salesOrder.Lines.Count,
                releasedReservedQuantity,
                productIds = salesOrder.Lines.Select(line => line.ProductId).Distinct().ToArray(),
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapSalesOrder(salesOrder);
    }

    private async Task<IReadOnlyDictionary<Guid, Product>> GetRequiredProductsAsync(
        IReadOnlyCollection<CreateSalesOrderLineCommand> lines,
        CancellationToken cancellationToken)
    {
        var productIds = lines
            .Select(line => line.ProductId)
            .Distinct()
            .ToArray();

        var productsById = await repository.FindProductsByIdsAsync(productIds, cancellationToken);

        foreach (var productId in productIds)
        {
            if (!productsById.ContainsKey(productId))
            {
                throw new KeyNotFoundException($"Product '{productId}' was not found.");
            }
        }

        return productsById;
    }

    private async Task<Customer> GetRequiredActiveCustomerAsync(Guid customerId, CancellationToken cancellationToken)
    {
        var customer = await repository.FindCustomerByIdAsync(customerId, cancellationToken)
            ?? throw new KeyNotFoundException($"Customer '{customerId}' was not found.");

        if (!customer.IsActive)
        {
            throw new InvalidOperationException($"Customer '{customer.Code}' is inactive and cannot be selected.");
        }

        return customer;
    }

    private async Task EnsureSalesOrderHasNoOpenPickingTasksAsync(
        Guid salesOrderId,
        CancellationToken cancellationToken)
    {
        if (await repository.HasOpenPickingTasksAsync(salesOrderId, cancellationToken))
        {
            throw new InvalidOperationException("Sales orders with active picking tasks cannot change reservation state.");
        }
    }

    private async Task EnsureSalesOrderReservationsHaveNoPickingTaskLineReferencesAsync(
        SalesOrder salesOrder,
        CancellationToken cancellationToken)
    {
        var reservationIds = salesOrder.Lines
            .SelectMany(line => line.Reservations)
            .Select(reservation => reservation.Id)
            .Distinct()
            .ToArray();

        if (reservationIds.Length == 0)
        {
            return;
        }

        if (await repository.HasPickingTaskLineReferencesAsync(reservationIds, cancellationToken))
        {
            throw new InvalidOperationException(PickingTaskLineReservationReferenceMessage);
        }
    }

    private async Task EnsureSalesOrderHasNoShipmentExecutionAsync(
        Guid salesOrderId,
        CancellationToken cancellationToken)
    {
        if (await repository.HasShipmentExecutionAsync(salesOrderId, cancellationToken))
        {
            throw new InvalidOperationException("Sales orders with shipment execution cannot change reservation state.");
        }
    }

    private bool ReleaseReservations(SalesOrder salesOrder, DateTimeOffset timestamp)
    {
        EnsureSalesOrderHasNoPickedQuantity(salesOrder, "Sales orders with picked quantity cannot release reservations.");

        var reservations = salesOrder.Lines
            .SelectMany(line => line.Reservations)
            .ToArray();

        if (reservations.Length == 0)
        {
            foreach (var line in salesOrder.Lines)
            {
                line.ReservedQuantity = 0m;
                line.PickedQuantity = 0m;
            }

            return false;
        }

        foreach (var reservation in reservations)
        {
            if (reservation.InventoryBalance.ReservedQuantity < reservation.Quantity)
            {
                throw new InvalidOperationException(
                    $"Inventory balance '{reservation.InventoryBalanceId}' cannot release more reserved stock than it currently has.");
            }

            reservation.InventoryBalance.ReservedQuantity -= reservation.Quantity;
            reservation.InventoryBalance.UpdatedAtUtc = timestamp;
        }

        repository.RemoveSalesOrderReservations(reservations);

        foreach (var line in salesOrder.Lines)
        {
            line.Reservations.Clear();
            line.ReservedQuantity = 0m;
            line.PickedQuantity = 0m;
        }

        return true;
    }

    private static SalesOrderDto MapSalesOrder(SalesOrder salesOrder) =>
        new(
            salesOrder.Id,
            salesOrder.CustomerId,
            salesOrder.Customer?.Code,
            salesOrder.Customer?.Name,
            salesOrder.Customer?.IsActive,
            salesOrder.Status,
            salesOrder.CreatedAtUtc,
            salesOrder.UpdatedAtUtc,
            salesOrder.ConfirmedAtUtc,
            salesOrder.CancelledAtUtc,
            salesOrder.Lines
                .OrderBy(line => line.Product.Sku, StringComparer.OrdinalIgnoreCase)
                .ThenBy(line => line.Id)
                .Select(line => new SalesOrderLineDto(
                    line.Id,
                    line.ProductId,
                    line.Product.Sku,
                    line.Product.Name,
                    line.OrderedQuantity,
                    line.ReservedQuantity,
                    line.PickedQuantity,
                    line.Reservations
                        .OrderBy(reservation => reservation.InventoryBalance.Location.Warehouse.Code, StringComparer.OrdinalIgnoreCase)
                        .ThenBy(reservation => reservation.InventoryBalance.Location.Zone.Code, StringComparer.OrdinalIgnoreCase)
                        .ThenBy(reservation => reservation.InventoryBalance.Location.Code, StringComparer.OrdinalIgnoreCase)
                        .ThenBy(reservation => reservation.InventoryBalanceId)
                        .Select(reservation => new SalesOrderReservationDto(
                            reservation.Id,
                            reservation.InventoryBalanceId,
                            reservation.InventoryBalance.LocationId,
                            reservation.InventoryBalance.Location.Warehouse.Code,
                            reservation.InventoryBalance.Location.Zone.Code,
                            reservation.InventoryBalance.Location.Code,
                            reservation.InventoryBalance.Location.Name,
                            reservation.InventoryBalance.Location.LocationType,
                            reservation.InventoryBalance.Location.IsActive,
                            reservation.InventoryBalance.Location.IsBlocked,
                            reservation.Quantity,
                            reservation.PickedQuantity))
                        .ToArray()))
                .ToArray());

    private static CreateSalesOrderLineCommand[] NormalizeLines(
        IReadOnlyCollection<CreateSalesOrderLineCommand>? lines)
    {
        EnsureHasLines(lines, "Sales order");
        var validatedLines = lines!;

        return validatedLines
            .Select(line =>
            {
                ValidatePositiveQuantity(line.OrderedQuantity, nameof(line.OrderedQuantity));
                return line with
                {
                    OrderedQuantity = decimal.Round(line.OrderedQuantity, 2, MidpointRounding.AwayFromZero),
                };
            })
            .ToArray();
    }

    private static IReadOnlyList<InventoryBalance> OrderReservationCandidates(IEnumerable<InventoryBalance> candidateBalances) =>
        candidateBalances
            .OrderBy(balance => balance.Location.Warehouse.Code, StringComparer.OrdinalIgnoreCase)
            .ThenBy(balance => balance.Location.Zone.Code, StringComparer.OrdinalIgnoreCase)
            .ThenBy(balance => balance.Location.Code, StringComparer.OrdinalIgnoreCase)
            .ThenBy(balance => balance.Id)
            .ToArray();

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

    private static void EnsureSalesOrderCanConfirm(SalesOrder salesOrder)
    {
        if (string.Equals(salesOrder.Status, SalesOrderStatus.Cancelled, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Cancelled sales orders cannot be confirmed.");
        }

        if (string.Equals(salesOrder.Status, SalesOrderStatus.FullyReserved, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Fully reserved sales orders do not require another confirm attempt.");
        }

        EnsureSalesOrderHasNoPickedQuantity(salesOrder, "Sales orders with picked quantity cannot be re-confirmed.");

        if (!string.Equals(salesOrder.Status, SalesOrderStatus.Draft, StringComparison.Ordinal) &&
            !string.Equals(salesOrder.Status, SalesOrderStatus.Confirmed, StringComparison.Ordinal) &&
            !string.Equals(salesOrder.Status, SalesOrderStatus.PartiallyReserved, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Sales orders can only be confirmed from Draft, Confirmed, or PartiallyReserved status.");
        }
    }

    private static void EnsureSalesOrderStatus(SalesOrder salesOrder, string expectedStatus, string message)
    {
        if (!string.Equals(salesOrder.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static void EnsureSalesOrderHasNoPickedQuantity(SalesOrder salesOrder, string message)
    {
        if (salesOrder.Lines.Any(line => line.PickedQuantity > 0m || line.Reservations.Any(reservation => reservation.PickedQuantity > 0m)))
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

    private static void ValidatePositiveQuantity(decimal quantity, string parameterName)
    {
        if (quantity <= 0m)
        {
            throw new ArgumentException("Value must be greater than zero.", parameterName);
        }
    }
}
