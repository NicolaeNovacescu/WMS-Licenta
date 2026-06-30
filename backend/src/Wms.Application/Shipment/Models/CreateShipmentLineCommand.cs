namespace Wms.Application.Shipment.Models;

public sealed record CreateShipmentLineCommand(
    Guid PickingTaskLineId,
    decimal QuantityToShip);
