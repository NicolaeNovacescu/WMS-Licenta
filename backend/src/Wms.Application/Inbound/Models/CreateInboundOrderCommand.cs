namespace Wms.Application.Inbound.Models;

public sealed record CreateInboundOrderCommand(
    Guid SupplierId,
    string SupplierInvoiceReference,
    string? Notes,
    IReadOnlyCollection<CreateInboundOrderLineCommand> Lines);
