namespace Wms.Application.Picking.Models;

public sealed record CreatePickingTaskCommand(
    Guid SalesOrderId,
    IReadOnlyCollection<CreatePickingTaskLineCommand> Lines);
