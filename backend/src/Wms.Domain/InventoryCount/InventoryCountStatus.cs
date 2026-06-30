namespace Wms.Domain.InventoryCount;

public static class InventoryCountStatus
{
    public const string Draft = "Draft";
    public const string InProgress = "InProgress";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All = [Draft, InProgress, Completed, Cancelled];
}
