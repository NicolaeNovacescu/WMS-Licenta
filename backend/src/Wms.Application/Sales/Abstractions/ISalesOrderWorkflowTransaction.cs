namespace Wms.Application.Sales.Abstractions;

public interface ISalesOrderWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
