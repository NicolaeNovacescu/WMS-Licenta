namespace Wms.Application.Inbound.Models;

public sealed record ReceiptLineDto(
    Guid Id,
    Guid InboundOrderLineId,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    Guid ReceivingLocationId,
    string ReceivingWarehouseCode,
    string ReceivingZoneCode,
    string ReceivingLocationCode,
    string ReceivingLocationName,
    decimal Quantity);
