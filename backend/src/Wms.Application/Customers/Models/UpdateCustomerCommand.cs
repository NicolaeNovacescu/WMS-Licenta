namespace Wms.Application.Customers.Models;

public sealed record UpdateCustomerCommand(
    string Code,
    string Name);
