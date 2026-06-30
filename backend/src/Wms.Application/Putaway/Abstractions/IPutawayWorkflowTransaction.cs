namespace Wms.Application.Putaway.Abstractions;

public interface IPutawayWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
