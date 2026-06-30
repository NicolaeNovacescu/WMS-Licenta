namespace Wms.Application.Inventory.Models;

public sealed record InventoryByProductDto(
    Guid ProductId,
    string ProductSku,
    string ProductName,
    decimal OnHandQuantity,
    decimal ReservedQuantity,
    decimal PickedQuantity,
    decimal AvailableQuantity,
    DateTimeOffset UpdatedAtUtc);
