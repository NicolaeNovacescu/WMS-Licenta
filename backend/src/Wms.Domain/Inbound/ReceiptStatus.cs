namespace Wms.Domain.Inbound;

public static class ReceiptStatus
{
    public const string Draft = "Draft";
    public const string InProgress = "InProgress";
    public const string Confirmed = "Confirmed";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All =
    [
        Draft,
        InProgress,
        Confirmed,
        Cancelled,
    ];

    public static string Normalize(string value)
    {
        var normalized = value.Trim();
        return All.SingleOrDefault(
                candidate => string.Equals(candidate, normalized, StringComparison.OrdinalIgnoreCase)) ??
            normalized;
    }
}
