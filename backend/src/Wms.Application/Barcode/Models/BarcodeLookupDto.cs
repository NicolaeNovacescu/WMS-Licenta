namespace Wms.Application.Barcode.Models;

public sealed record BarcodeLookupDto(
    string LookupType,
    Guid EntityId,
    string Code,
    string DisplayName,
    string Barcode,
    bool IsActive);
