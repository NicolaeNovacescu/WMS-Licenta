namespace Wms.Application.Inbound.Models;

public sealed record InboundOrderLineDto(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    decimal ExpectedQuantity,
    decimal ReceivedQuantity);
