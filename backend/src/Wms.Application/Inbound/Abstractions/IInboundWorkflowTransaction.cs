namespace Wms.Application.Inbound.Abstractions;

public interface IInboundWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
