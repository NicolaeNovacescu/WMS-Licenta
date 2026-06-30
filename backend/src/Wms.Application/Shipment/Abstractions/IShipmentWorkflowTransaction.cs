namespace Wms.Application.Shipment.Abstractions;

public interface IShipmentWorkflowTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
