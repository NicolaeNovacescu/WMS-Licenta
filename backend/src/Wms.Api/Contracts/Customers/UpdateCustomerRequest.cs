namespace Wms.Api.Contracts.Customers;

public sealed record UpdateCustomerRequest(
    string Code,
    string Name);
