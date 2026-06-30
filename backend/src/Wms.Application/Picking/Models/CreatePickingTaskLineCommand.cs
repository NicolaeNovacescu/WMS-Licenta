namespace Wms.Application.Picking.Models;

public sealed record CreatePickingTaskLineCommand(
    Guid SalesOrderReservationId,
    decimal QuantityToPick);
