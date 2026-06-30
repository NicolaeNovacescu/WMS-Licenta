using Wms.Application.Barcode.Abstractions;
using Wms.Application.Barcode.Models;

namespace Wms.Application.Barcode;

public sealed class BarcodeLookupService(IBarcodeLookupRepository repository)
{
    private const string ProductLookupType = "Product";

    public async Task<BarcodeLookupDto?> LookupAsync(string barcodeValue, CancellationToken cancellationToken)
    {
        var normalizedBarcode = NormalizeBarcode(barcodeValue);
        var matchingProducts = await repository.ListProductsByBarcodeAsync(normalizedBarcode, cancellationToken);

        return matchingProducts.Count switch
        {
            0 => null,
            1 => MapProduct(matchingProducts[0]),
            _ => throw new InvalidOperationException(
                $"Barcode '{normalizedBarcode}' is assigned to multiple products and cannot be resolved uniquely."),
        };
    }

    private static BarcodeLookupDto MapProduct(Wms.Domain.Catalog.Product product) =>
        new(
            ProductLookupType,
            product.Id,
            product.Sku,
            product.Name,
            product.Barcode,
            product.IsActive);

    private static string NormalizeBarcode(string? barcodeValue)
    {
        var normalized = barcodeValue?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("A barcode value is required.", nameof(barcodeValue));
        }

        return normalized;
    }
}
