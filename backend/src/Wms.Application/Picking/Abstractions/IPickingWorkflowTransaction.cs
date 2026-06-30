namespace Wms.Application.Picking.Abstractions;

public interface IPickingWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
