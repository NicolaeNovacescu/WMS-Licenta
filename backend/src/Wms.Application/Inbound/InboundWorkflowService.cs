using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Application.Inbound.Abstractions;
using Wms.Application.Inbound.Models;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using Wms.Domain.WarehouseStructure;

namespace Wms.Application.Inbound;

public sealed class InboundWorkflowService(IInboundWorkflowRepository repository, IAuditLogWriter? auditLogWriter = null)
{
    private readonly IAuditLogWriter _auditLogWriter = auditLogWriter ?? NullAuditLogWriter.Instance;

    public async Task<IReadOnlyList<InboundOrderDto>> ListInboundOrdersAsync(CancellationToken cancellationToken)
    {
        var inboundOrders = await repository.ListInboundOrdersAsync(cancellationToken);
        return inboundOrders
            .Select(MapInboundOrder)
            .ToArray();
    }

    public async Task<InboundOrderDto?> GetInboundOrderByIdAsync(
        Guid inboundOrderId,
        CancellationToken cancellationToken)
    {
        var inboundOrder = await repository.FindInboundOrderByIdAsync(inboundOrderId, cancellationToken);
        return inboundOrder is null ? null : MapInboundOrder(inboundOrder);
    }

    public async Task<InboundOrderDto> CreateInboundOrderAsync(
        CreateInboundOrderCommand command,
        CancellationToken cancellationToken)
    {
        var supplier = await repository.FindSupplierByIdAsync(command.SupplierId, cancellationToken)
            ?? throw new KeyNotFoundException($"Supplier '{command.SupplierId}' was not found.");
        EnsureSupplierIsActive(supplier);

        var lineCommands = NormalizeInboundLines(command.Lines);
        var productsById = await GetRequiredProductsAsync(lineCommands, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        var inboundOrder = new InboundOrder
        {
            Id = Guid.NewGuid(),
            SupplierId = supplier.Id,
            Supplier = supplier,
            SupplierInvoiceReference = NormalizeRequired(
                command.SupplierInvoiceReference,
                nameof(command.SupplierInvoiceReference)),
            Status = InboundOrderStatus.Draft,
            Notes = NormalizeOptional(command.Notes),
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        foreach (var lineCommand in lineCommands)
        {
            var product = productsById[lineCommand.ProductId];

            inboundOrder.Lines.Add(new InboundOrderLine
            {
                Id = Guid.NewGuid(),
                InboundOrderId = inboundOrder.Id,
                InboundOrder = inboundOrder,
                ProductId = product.Id,
                Product = product,
                ExpectedQuantity = lineCommand.ExpectedQuantity,
                ReceivedQuantity = 0m,
            });
        }

        repository.AddInboundOrder(inboundOrder);
        await repository.SaveChangesAsync(cancellationToken);

        return MapInboundOrder(inboundOrder);
    }

    public async Task<InboundOrderDto> UpdateInboundOrderAsync(
        Guid inboundOrderId,
        UpdateInboundOrderCommand command,
        CancellationToken cancellationToken)
    {
        var inboundOrder = await repository.FindInboundOrderByIdAsync(inboundOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Inbound order '{inboundOrderId}' was not found.");

        EnsureInboundOrderStatus(
            inboundOrder,
            InboundOrderStatus.Draft,
            "Only draft inbound orders can be updated.");

        var supplier = await repository.FindSupplierByIdAsync(command.SupplierId, cancellationToken)
            ?? throw new KeyNotFoundException($"Supplier '{command.SupplierId}' was not found.");
        EnsureSupplierIsActive(supplier);

        var lineCommands = NormalizeInboundLines(command.Lines);
        var productsById = await GetRequiredProductsAsync(lineCommands, cancellationToken);
        var existingLines = inboundOrder.Lines.ToArray();

        repository.RemoveInboundOrderLines(existingLines);
        inboundOrder.Lines.Clear();

        inboundOrder.SupplierId = supplier.Id;
        inboundOrder.Supplier = supplier;
        inboundOrder.SupplierInvoiceReference = NormalizeRequired(
            command.SupplierInvoiceReference,
            nameof(command.SupplierInvoiceReference));
        inboundOrder.Notes = NormalizeOptional(command.Notes);
        inboundOrder.UpdatedAtUtc = DateTimeOffset.UtcNow;

        foreach (var lineCommand in lineCommands)
        {
            var product = productsById[lineCommand.ProductId];

            inboundOrder.Lines.Add(new InboundOrderLine
            {
                Id = Guid.NewGuid(),
                InboundOrderId = inboundOrder.Id,
                InboundOrder = inboundOrder,
                ProductId = product.Id,
                Product = product,
                ExpectedQuantity = lineCommand.ExpectedQuantity,
                ReceivedQuantity = 0m,
            });
        }

        await repository.SaveChangesAsync(cancellationToken);

        return MapInboundOrder(inboundOrder);
    }

    public async Task<InboundOrderDto> MarkInboundOrderReadyAsync(
        Guid inboundOrderId,
        CancellationToken cancellationToken)
    {
        var inboundOrder = await repository.FindInboundOrderByIdAsync(inboundOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Inbound order '{inboundOrderId}' was not found.");

        EnsureInboundOrderStatus(
            inboundOrder,
            InboundOrderStatus.Draft,
            "Only draft inbound orders can be marked ready for receipt.");

        EnsureHasLines(inboundOrder.Lines, "Inbound order");

        inboundOrder.Status = InboundOrderStatus.ReadyForReceipt;
        inboundOrder.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapInboundOrder(inboundOrder);
    }

    public async Task<InboundOrderDto> CancelInboundOrderAsync(
        Guid inboundOrderId,
        CancellationToken cancellationToken)
    {
        var inboundOrder = await repository.FindInboundOrderByIdAsync(inboundOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Inbound order '{inboundOrderId}' was not found.");

        if (string.Equals(inboundOrder.Status, InboundOrderStatus.Cancelled, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Cancelled inbound orders cannot be changed.");
        }

        if (inboundOrder.Lines.Any(line => line.ReceivedQuantity > 0m))
        {
            throw new InvalidOperationException(
                "Inbound orders with confirmed received quantity cannot be cancelled.");
        }

        inboundOrder.Status = InboundOrderStatus.Cancelled;
        inboundOrder.CancelledAtUtc = DateTimeOffset.UtcNow;
        inboundOrder.UpdatedAtUtc = inboundOrder.CancelledAtUtc.Value;

        await repository.SaveChangesAsync(cancellationToken);

        return MapInboundOrder(inboundOrder);
    }

    public async Task<IReadOnlyList<ReceiptDto>> ListReceiptsAsync(CancellationToken cancellationToken)
    {
        var receipts = await repository.ListReceiptsAsync(cancellationToken);
        return receipts
            .Select(MapReceipt)
            .ToArray();
    }

    public async Task<ReceiptDto?> GetReceiptByIdAsync(Guid receiptId, CancellationToken cancellationToken)
    {
        var receipt = await repository.FindReceiptByIdAsync(receiptId, cancellationToken);
        return receipt is null ? null : MapReceipt(receipt);
    }

    public async Task<ReceiptDto> CreateReceiptAsync(
        CreateReceiptCommand command,
        CancellationToken cancellationToken)
    {
        var inboundOrder = await repository.FindInboundOrderByIdAsync(command.InboundOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Inbound order '{command.InboundOrderId}' was not found.");

        EnsureInboundOrderReceivable(inboundOrder);

        var lineCommands = NormalizeReceiptLines(command.Lines);
        EnsureHasLines(lineCommands, "Receipt");

        var inboundOrderLinesById = inboundOrder.Lines.ToDictionary(line => line.Id);
        ValidateReceiptLineBindings(lineCommands, inboundOrderLinesById);
        ValidateNoOverReceipt(lineCommands, inboundOrderLinesById);

        var locationsById = await GetRequiredLocationsAsync(
            lineCommands.Select(line => line.ReceivingLocationId).Distinct().ToArray(),
            cancellationToken);

        var receipt = new Receipt
        {
            Id = Guid.NewGuid(),
            InboundOrderId = inboundOrder.Id,
            InboundOrder = inboundOrder,
            Status = ReceiptStatus.Draft,
            Notes = NormalizeOptional(command.Notes),
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        foreach (var lineCommand in lineCommands)
        {
            var inboundOrderLine = inboundOrderLinesById[lineCommand.InboundOrderLineId];
            var receivingLocation = locationsById[lineCommand.ReceivingLocationId];

            receipt.Lines.Add(new ReceiptLine
            {
                Id = Guid.NewGuid(),
                ReceiptId = receipt.Id,
                Receipt = receipt,
                InboundOrderLineId = inboundOrderLine.Id,
                InboundOrderLine = inboundOrderLine,
                ReceivingLocationId = receivingLocation.Id,
                ReceivingLocation = receivingLocation,
                Quantity = lineCommand.Quantity,
            });
        }

        repository.AddReceipt(receipt);
        await repository.SaveChangesAsync(cancellationToken);

        return MapReceipt(receipt);
    }

    public async Task<ReceiptDto> StartReceiptAsync(Guid receiptId, CancellationToken cancellationToken)
    {
        var receipt = await repository.FindReceiptByIdAsync(receiptId, cancellationToken)
            ?? throw new KeyNotFoundException($"Receipt '{receiptId}' was not found.");

        EnsureReceiptStatus(receipt, ReceiptStatus.Draft, "Only draft receipts can be started.");
        EnsureInboundOrderReceivable(receipt.InboundOrder);
        EnsureHasLines(receipt.Lines, "Receipt");

        receipt.Status = ReceiptStatus.InProgress;
        receipt.StartedAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapReceipt(receipt);
    }

    public async Task<ReceiptDto> ConfirmReceiptAsync(
        Guid receiptId,
        Guid performedByUserId,
        CancellationToken cancellationToken)
    {
        await using var transaction = await repository.BeginTransactionAsync(cancellationToken);

        var receipt = await repository.FindReceiptByIdAsync(receiptId, cancellationToken)
            ?? throw new KeyNotFoundException($"Receipt '{receiptId}' was not found.");

        EnsureReceiptStatus(receipt, ReceiptStatus.InProgress, "Only in-progress receipts can be confirmed.");
        EnsureInboundOrderReceivable(receipt.InboundOrder);
        EnsureHasLines(receipt.Lines, "Receipt");

        var inboundOrderLinesById = receipt.InboundOrder.Lines.ToDictionary(line => line.Id);
        var receiptLines = receipt.Lines
            .Select(line => new CreateReceiptLineCommand(line.InboundOrderLineId, line.ReceivingLocationId, line.Quantity))
            .ToArray();

        ValidateReceiptLineBindings(receiptLines, inboundOrderLinesById);
        ValidateNoOverReceipt(receiptLines, inboundOrderLinesById);

        var confirmationTimestamp = DateTimeOffset.UtcNow;

        foreach (var receiptLine in receipt.Lines)
        {
            ValidateReceivingLocation(receiptLine.ReceivingLocation);

            var inboundOrderLine = inboundOrderLinesById[receiptLine.InboundOrderLineId];
            inboundOrderLine.ReceivedQuantity += receiptLine.Quantity;

            var balance = await repository.FindInventoryBalanceAsync(
                inboundOrderLine.ProductId,
                receiptLine.ReceivingLocationId,
                cancellationToken);

            if (balance is null)
            {
                balance = new InventoryBalance
                {
                    Id = Guid.NewGuid(),
                    ProductId = inboundOrderLine.ProductId,
                    Product = inboundOrderLine.Product,
                    LocationId = receiptLine.ReceivingLocationId,
                    Location = receiptLine.ReceivingLocation,
                    OnHandQuantity = 0m,
                    ReservedQuantity = 0m,
                    UpdatedAtUtc = confirmationTimestamp,
                };

                repository.AddInventoryBalance(balance);
            }

            balance.OnHandQuantity += receiptLine.Quantity;
            balance.UpdatedAtUtc = confirmationTimestamp;

            repository.AddInventoryMovement(new InventoryMovement
            {
                Id = Guid.NewGuid(),
                ProductId = inboundOrderLine.ProductId,
                Product = inboundOrderLine.Product,
                Quantity = receiptLine.Quantity,
                MovementType = InventoryMovementType.Addition,
                SourceLocationId = null,
                DestinationLocationId = receiptLine.ReceivingLocationId,
                DestinationLocation = receiptLine.ReceivingLocation,
                ReferenceType = "Receipt",
                ReferenceId = receipt.Id.ToString(),
                PerformedAtUtc = confirmationTimestamp,
                PerformedByUserId = performedByUserId,
                Notes = receipt.Notes,
            });
        }

        receipt.Status = ReceiptStatus.Confirmed;
        receipt.ConfirmedAtUtc = confirmationTimestamp;
        receipt.InboundOrder.Status = DeriveInboundOrderStatus(receipt.InboundOrder);
        receipt.InboundOrder.UpdatedAtUtc = confirmationTimestamp;
        _auditLogWriter.Write(new AuditLogWriteEntry(
            "ReceiptConfirmed",
            "Receipt",
            receipt.Id.ToString(),
            $"Confirmed receipt '{receipt.Id}' for inbound order '{receipt.InboundOrderId}'.",
            new
            {
                statusFrom = ReceiptStatus.InProgress,
                statusTo = ReceiptStatus.Confirmed,
                inboundOrderId = receipt.InboundOrderId,
                lineCount = receipt.Lines.Count,
                totalQuantity = receipt.Lines.Sum(line => line.Quantity),
                productIds = receipt.Lines.Select(line => line.InboundOrderLine.ProductId).Distinct().ToArray(),
                receivingLocationIds = receipt.Lines.Select(line => line.ReceivingLocationId).Distinct().ToArray(),
            }));

        await repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapReceipt(receipt);
    }

    public async Task<ReceiptDto> CancelReceiptAsync(Guid receiptId, CancellationToken cancellationToken)
    {
        var receipt = await repository.FindReceiptByIdAsync(receiptId, cancellationToken)
            ?? throw new KeyNotFoundException($"Receipt '{receiptId}' was not found.");

        if (!string.Equals(receipt.Status, ReceiptStatus.Draft, StringComparison.Ordinal) &&
            !string.Equals(receipt.Status, ReceiptStatus.InProgress, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only draft or in-progress receipts can be cancelled.");
        }

        receipt.Status = ReceiptStatus.Cancelled;
        receipt.CancelledAtUtc = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return MapReceipt(receipt);
    }

    private async Task<IReadOnlyDictionary<Guid, Wms.Domain.Catalog.Product>> GetRequiredProductsAsync(
        IReadOnlyCollection<CreateInboundOrderLineCommand> lines,
        CancellationToken cancellationToken)
    {
        var productIds = lines.Select(line => line.ProductId).Distinct().ToArray();
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

    private async Task<IReadOnlyDictionary<Guid, Location>> GetRequiredLocationsAsync(
        IReadOnlyCollection<Guid> locationIds,
        CancellationToken cancellationToken)
    {
        var locationsById = await repository.FindLocationsByIdsAsync(locationIds, cancellationToken);

        foreach (var locationId in locationIds)
        {
            if (!locationsById.ContainsKey(locationId))
            {
                throw new KeyNotFoundException($"Location '{locationId}' was not found.");
            }
        }

        return locationsById;
    }

    private static InboundOrderDto MapInboundOrder(InboundOrder inboundOrder) =>
        new(
            inboundOrder.Id,
            inboundOrder.SupplierId,
            inboundOrder.Supplier.Code,
            inboundOrder.Supplier.Name,
            inboundOrder.SupplierInvoiceReference,
            inboundOrder.Status,
            EmptyToNull(inboundOrder.Notes),
            inboundOrder.CreatedAtUtc,
            inboundOrder.UpdatedAtUtc,
            inboundOrder.CancelledAtUtc,
            inboundOrder.Lines
                .OrderBy(line => line.Product.Sku)
                .Select(line => new InboundOrderLineDto(
                    line.Id,
                    line.ProductId,
                    line.Product.Sku,
                    line.Product.Name,
                    line.ExpectedQuantity,
                    line.ReceivedQuantity))
                .ToArray());

    private static ReceiptDto MapReceipt(Receipt receipt) =>
        new(
            receipt.Id,
            receipt.InboundOrderId,
            receipt.InboundOrder.Status,
            receipt.InboundOrder.SupplierId,
            receipt.InboundOrder.Supplier.Code,
            receipt.InboundOrder.Supplier.Name,
            receipt.InboundOrder.SupplierInvoiceReference,
            receipt.Status,
            EmptyToNull(receipt.Notes),
            receipt.CreatedAtUtc,
            receipt.StartedAtUtc,
            receipt.ConfirmedAtUtc,
            receipt.CancelledAtUtc,
            receipt.Lines
                .OrderBy(line => line.InboundOrderLine.Product.Sku)
                .ThenBy(line => line.ReceivingLocation.Code)
                .Select(line => new ReceiptLineDto(
                    line.Id,
                    line.InboundOrderLineId,
                    line.InboundOrderLine.ProductId,
                    line.InboundOrderLine.Product.Sku,
                    line.InboundOrderLine.Product.Name,
                    line.ReceivingLocationId,
                    line.ReceivingLocation.Warehouse.Code,
                    line.ReceivingLocation.Zone.Code,
                    line.ReceivingLocation.Code,
                    line.ReceivingLocation.Name,
                    line.Quantity))
                .ToArray());

    private static CreateInboundOrderLineCommand[] NormalizeInboundLines(
        IReadOnlyCollection<CreateInboundOrderLineCommand>? lines)
    {
        EnsureHasLines(lines, "Inbound order");
        var validatedLines = lines!;

        return validatedLines
            .Select(line =>
            {
                ValidatePositiveQuantity(line.ExpectedQuantity, nameof(line.ExpectedQuantity));
                return line with { ExpectedQuantity = decimal.Round(line.ExpectedQuantity, 2, MidpointRounding.AwayFromZero) };
            })
            .ToArray();
    }

    private static CreateReceiptLineCommand[] NormalizeReceiptLines(
        IReadOnlyCollection<CreateReceiptLineCommand>? lines)
    {
        EnsureHasLines(lines, "Receipt");
        var validatedLines = lines!;

        return validatedLines
            .Select(line =>
            {
                ValidatePositiveQuantity(line.Quantity, nameof(line.Quantity));
                return line with { Quantity = decimal.Round(line.Quantity, 2, MidpointRounding.AwayFromZero) };
            })
            .ToArray();
    }

    private static void ValidateReceiptLineBindings(
        IReadOnlyCollection<CreateReceiptLineCommand> lines,
        IReadOnlyDictionary<Guid, InboundOrderLine> inboundOrderLinesById)
    {
        foreach (var line in lines)
        {
            if (!inboundOrderLinesById.ContainsKey(line.InboundOrderLineId))
            {
                throw new KeyNotFoundException(
                    $"Inbound order line '{line.InboundOrderLineId}' was not found on the selected inbound order.");
            }
        }
    }

    private static void ValidateNoOverReceipt(
        IReadOnlyCollection<CreateReceiptLineCommand> lines,
        IReadOnlyDictionary<Guid, InboundOrderLine> inboundOrderLinesById)
    {
        foreach (var lineGroup in lines.GroupBy(line => line.InboundOrderLineId))
        {
            var inboundOrderLine = inboundOrderLinesById[lineGroup.Key];
            var remainingQuantity = inboundOrderLine.ExpectedQuantity - inboundOrderLine.ReceivedQuantity;
            var requestedQuantity = lineGroup.Sum(line => line.Quantity);

            if (requestedQuantity > remainingQuantity)
            {
                throw new InvalidOperationException(
                    $"Receipt quantity for product '{inboundOrderLine.Product.Sku}' exceeds the remaining expected quantity.");
            }
        }
    }

    private static void ValidateReceivingLocation(Location location)
    {
        if (!location.IsActive)
        {
            throw new InvalidOperationException(
                $"Receiving location '{location.Code}' must be active to confirm receipt.");
        }

        if (location.IsBlocked)
        {
            throw new InvalidOperationException(
                $"Receiving location '{location.Code}' must be unblocked to confirm receipt.");
        }

        if (!string.Equals(location.LocationType, LocationType.Receiving, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Location '{location.Code}' must be of type {LocationType.Receiving} to confirm receipt.");
        }
    }

    private static void EnsureInboundOrderReceivable(InboundOrder inboundOrder)
    {
        if (!string.Equals(inboundOrder.Status, InboundOrderStatus.ReadyForReceipt, StringComparison.Ordinal) &&
            !string.Equals(inboundOrder.Status, InboundOrderStatus.PartiallyReceived, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "Only inbound orders ready for receipt can be processed.");
        }
    }

    private static void EnsureSupplierIsActive(Supplier supplier)
    {
        if (!supplier.IsActive)
        {
            throw new InvalidOperationException(
                $"Supplier '{supplier.Code}' is inactive and cannot be selected for inbound authoring.");
        }
    }

    private static void EnsureInboundOrderStatus(
        InboundOrder inboundOrder,
        string expectedStatus,
        string message)
    {
        if (!string.Equals(inboundOrder.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static void EnsureReceiptStatus(Receipt receipt, string expectedStatus, string message)
    {
        if (!string.Equals(receipt.Status, expectedStatus, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(message);
        }
    }

    private static string DeriveInboundOrderStatus(InboundOrder inboundOrder)
    {
        var totalExpected = inboundOrder.Lines.Sum(line => line.ExpectedQuantity);
        var totalReceived = inboundOrder.Lines.Sum(line => line.ReceivedQuantity);

        if (totalReceived <= 0m)
        {
            return InboundOrderStatus.ReadyForReceipt;
        }

        return totalReceived >= totalExpected
            ? InboundOrderStatus.FullyReceived
            : InboundOrderStatus.PartiallyReceived;
    }

    private static string NormalizeRequired(string? value, string parameterName)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("A value is required.", parameterName);
        }

        return normalized;
    }

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static string? EmptyToNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;

    private static void ValidatePositiveQuantity(decimal quantity, string parameterName)
    {
        if (quantity <= 0m)
        {
            throw new ArgumentException("Value must be greater than zero.", parameterName);
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
