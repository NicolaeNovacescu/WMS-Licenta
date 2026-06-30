namespace Wms.Api.Contracts.Suppliers;

public sealed record SupplierResponse(Guid Id, string Code, string Name, bool IsActive);
