namespace Wms.Application.Shipment.Models;

public sealed record ShipmentDto(
    Guid Id,
    Guid SalesOrderId,
    string SalesOrderStatus,
    string Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<ShipmentLineDto> Lines);
