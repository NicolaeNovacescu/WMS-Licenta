namespace Wms.Api.Contracts.Inventory;

public sealed record InventoryByProductResponse(
    Guid ProductId,
    string ProductSku,
    string ProductName,
    decimal OnHandQuantity,
    decimal ReservedQuantity,
    decimal PickedQuantity,
    decimal AvailableQuantity,
    DateTimeOffset UpdatedAtUtc);
