namespace Wms.Domain.Sales;

public static class SalesOrderStatus
{
    public const string Draft = "Draft";
    public const string Confirmed = "Confirmed";
    public const string PartiallyReserved = "PartiallyReserved";
    public const string FullyReserved = "FullyReserved";
    public const string Cancelled = "Cancelled";

    public static readonly IReadOnlyCollection<string> All =
    [
        Draft,
        Confirmed,
        PartiallyReserved,
        FullyReserved,
        Cancelled,
    ];

    public static string Normalize(string? status) =>
        All.Single(candidate => string.Equals(candidate, status, StringComparison.OrdinalIgnoreCase));
}
