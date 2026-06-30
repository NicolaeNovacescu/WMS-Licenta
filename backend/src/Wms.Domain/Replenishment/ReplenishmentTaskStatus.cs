namespace Wms.Domain.Replenishment;

public static class ReplenishmentTaskStatus
{
    public const string Pending = "Pending";
    public const string InProgress = "InProgress";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All =
    [
        Pending,
        InProgress,
        Completed,
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
