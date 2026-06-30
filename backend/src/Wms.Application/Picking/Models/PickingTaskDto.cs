namespace Wms.Application.Picking.Models;

public sealed record PickingTaskDto(
    Guid Id,
    Guid SalesOrderId,
    string SalesOrderStatus,
    string Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<PickingTaskLineDto> Lines);
