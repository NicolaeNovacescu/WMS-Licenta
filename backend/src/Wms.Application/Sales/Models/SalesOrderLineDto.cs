namespace Wms.Application.Sales.Models;

public sealed record SalesOrderLineDto(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    decimal OrderedQuantity,
    decimal ReservedQuantity,
    decimal PickedQuantity,
    IReadOnlyList<SalesOrderReservationDto> Reservations);
