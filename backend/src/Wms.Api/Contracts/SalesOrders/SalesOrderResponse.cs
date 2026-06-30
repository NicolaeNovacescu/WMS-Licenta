namespace Wms.Api.Contracts.SalesOrders;

public sealed record SalesOrderResponse(
    Guid Id,
    Guid? CustomerId,
    string? CustomerCode,
    string? CustomerName,
    bool? CustomerIsActive,
    string Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    DateTimeOffset? ConfirmedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<SalesOrderLineResponse> Lines);

public sealed record SalesOrderLineResponse(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    decimal OrderedQuantity,
    decimal ReservedQuantity,
    decimal PickedQuantity,
    IReadOnlyList<SalesOrderReservationResponse> Reservations);

public sealed record SalesOrderReservationResponse(
    Guid Id,
    Guid InventoryBalanceId,
    Guid LocationId,
    string WarehouseCode,
    string ZoneCode,
    string LocationCode,
    string LocationName,
    string LocationType,
    bool LocationIsActive,
    bool LocationIsBlocked,
    decimal Quantity,
    decimal PickedQuantity);
