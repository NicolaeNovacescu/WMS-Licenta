namespace Wms.Application.Transfer.Abstractions;

public interface ITransferWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
