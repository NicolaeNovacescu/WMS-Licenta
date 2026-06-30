namespace Wms.Application.Replenishment.Abstractions;

public interface IReplenishmentWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
