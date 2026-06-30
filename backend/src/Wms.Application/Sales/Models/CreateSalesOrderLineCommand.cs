namespace Wms.Application.Sales.Models;

public sealed record CreateSalesOrderLineCommand(
    Guid ProductId,
    decimal OrderedQuantity);
