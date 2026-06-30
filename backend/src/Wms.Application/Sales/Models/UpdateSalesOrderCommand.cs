namespace Wms.Application.Sales.Models;

public sealed record UpdateSalesOrderCommand(
    Guid CustomerId,
    IReadOnlyList<CreateSalesOrderLineCommand> Lines);
