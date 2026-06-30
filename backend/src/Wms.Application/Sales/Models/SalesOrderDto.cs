namespace Wms.Application.Sales.Models;

public sealed record SalesOrderDto(
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
    IReadOnlyList<SalesOrderLineDto> Lines);
