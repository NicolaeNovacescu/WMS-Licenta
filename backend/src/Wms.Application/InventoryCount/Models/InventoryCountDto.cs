namespace Wms.Application.InventoryCount.Models;

public sealed record InventoryCountDto(
    Guid Id,
    string Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset? CancelledAtUtc,
    IReadOnlyList<InventoryCountLineDto> Lines);
