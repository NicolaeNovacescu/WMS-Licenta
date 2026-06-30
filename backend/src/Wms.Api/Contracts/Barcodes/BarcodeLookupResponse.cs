namespace Wms.Api.Contracts.Barcodes;

public sealed record BarcodeLookupResponse(
    string LookupType,
    Guid EntityId,
    string Code,
    string DisplayName,
    string Barcode,
    bool IsActive);
