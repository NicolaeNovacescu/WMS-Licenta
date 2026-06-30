using Wms.Domain.Picking;
using Wms.Domain.Sales;

namespace Wms.Application.Picking.Abstractions;

public interface IPickingWorkflowRepository
{
    Task<IReadOnlyList<PickingTask>> ListPickingTasksAsync(CancellationToken cancellationToken);
    Task<PickingTask?> FindPickingTaskByIdAsync(Guid pickingTaskId, CancellationToken cancellationToken);
    Task<SalesOrder?> FindSalesOrderByIdAsync(Guid salesOrderId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, decimal>> ListOpenAllocatedQuantitiesByReservationIdsAsync(
        IReadOnlyCollection<Guid> reservationIds,
        Guid? excludedPickingTaskId,
        CancellationToken cancellationToken);
    void AddPickingTask(PickingTask pickingTask);
    Task<IPickingWorkflowTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
