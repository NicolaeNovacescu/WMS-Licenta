namespace Wms.Application.Catalog;

public sealed class DuplicateBarcodeException : InvalidOperationException
{
    public DuplicateBarcodeException(string? barcode = null, Exception? innerException = null)
        : base(BuildMessage(barcode), innerException)
    {
        Barcode = barcode ?? string.Empty;
    }

    public string Barcode { get; }

    private static string BuildMessage(string? barcode) =>
        string.IsNullOrWhiteSpace(barcode)
            ? "The barcode value is already assigned to another product."
            : $"Barcode '{barcode}' is already assigned to another product.";
}
