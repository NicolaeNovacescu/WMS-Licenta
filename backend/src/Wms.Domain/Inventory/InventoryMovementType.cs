namespace Wms.Domain.Inventory;

public static class InventoryMovementType
{
    public const string Addition = "ADDITION";
    public const string Removal = "REMOVAL";
    public const string Relocation = "RELOCATION";

    public static readonly string[] All = [Addition, Removal, Relocation];

    public static string Normalize(string value) => value.Trim().ToUpperInvariant();
}
