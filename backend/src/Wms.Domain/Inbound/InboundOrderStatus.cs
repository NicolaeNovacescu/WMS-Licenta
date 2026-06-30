namespace Wms.Domain.Inbound;

public static class InboundOrderStatus
{
    public const string Draft = "Draft";
    public const string ReadyForReceipt = "ReadyForReceipt";
    public const string PartiallyReceived = "PartiallyReceived";
    public const string FullyReceived = "FullyReceived";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All =
    [
        Draft,
        ReadyForReceipt,
        PartiallyReceived,
        FullyReceived,
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
