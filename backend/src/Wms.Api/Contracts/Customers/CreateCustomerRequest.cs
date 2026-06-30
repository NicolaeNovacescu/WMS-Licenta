namespace Wms.Api.Contracts.Customers;

public sealed record CreateCustomerRequest(
    string Code,
    string Name);
