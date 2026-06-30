namespace Wms.Api.Contracts.SalesOrders;

public sealed record CreateSalesOrderRequest(
    Guid CustomerId,
    IReadOnlyList<CreateSalesOrderLineRequest> Lines);

public sealed record CreateSalesOrderLineRequest(
    Guid ProductId,
    decimal OrderedQuantity);
