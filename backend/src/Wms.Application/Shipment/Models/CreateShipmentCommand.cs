namespace Wms.Application.Shipment.Models;

public sealed record CreateShipmentCommand(
    Guid SalesOrderId,
    IReadOnlyCollection<CreateShipmentLineCommand> Lines);
