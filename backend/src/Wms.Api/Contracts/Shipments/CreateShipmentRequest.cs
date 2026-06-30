namespace Wms.Api.Contracts.Shipments;

public sealed record CreateShipmentRequest(
    Guid SalesOrderId,
    IReadOnlyList<CreateShipmentLineRequest>? Lines);

public sealed record CreateShipmentLineRequest(
    Guid PickingTaskLineId,
    decimal QuantityToShip);
