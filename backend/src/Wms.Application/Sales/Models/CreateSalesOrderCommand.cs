namespace Wms.Application.Sales.Models;

public sealed record CreateSalesOrderCommand(
    Guid CustomerId,
    IReadOnlyList<CreateSalesOrderLineCommand> Lines);
