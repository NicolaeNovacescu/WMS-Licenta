using Wms.Domain.Catalog;

namespace Wms.Application.Barcode.Abstractions;

public interface IBarcodeLookupRepository
{
    Task<IReadOnlyList<Product>> ListProductsByBarcodeAsync(string barcode, CancellationToken cancellationToken);
}
