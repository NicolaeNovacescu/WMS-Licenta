namespace Wms.Application.Customers.Models;

public sealed record CreateCustomerCommand(
    string Code,
    string Name);
