namespace Wms.Application.Inbound.Models;

public sealed record UpdateInboundOrderCommand(
    Guid SupplierId,
    string SupplierInvoiceReference,
    string? Notes,
    IReadOnlyCollection<CreateInboundOrderLineCommand> Lines);
