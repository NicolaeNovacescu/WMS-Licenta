namespace Wms.Api.Contracts.SalesOrders;

public sealed record UpdateSalesOrderRequest(
    Guid CustomerId,
    IReadOnlyList<UpdateSalesOrderLineRequest> Lines);

public sealed record UpdateSalesOrderLineRequest(
    Guid ProductId,
    decimal OrderedQuantity);
