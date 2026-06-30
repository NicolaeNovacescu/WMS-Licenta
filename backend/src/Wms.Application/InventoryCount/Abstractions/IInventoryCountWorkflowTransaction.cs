namespace Wms.Application.InventoryCount.Abstractions;

public interface IInventoryCountWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
