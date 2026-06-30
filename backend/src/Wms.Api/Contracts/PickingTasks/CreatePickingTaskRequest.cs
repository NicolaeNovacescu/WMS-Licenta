namespace Wms.Api.Contracts.PickingTasks;

public sealed record CreatePickingTaskRequest(
    Guid SalesOrderId,
    IReadOnlyList<CreatePickingTaskLineRequest>? Lines);

public sealed record CreatePickingTaskLineRequest(
    Guid SalesOrderReservationId,
    decimal QuantityToPick);
