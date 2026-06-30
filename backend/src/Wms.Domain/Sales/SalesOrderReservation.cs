using Wms.Domain.Inventory;

namespace Wms.Domain.Sales;

public sealed class SalesOrderReservation
{
    public Guid Id { get; set; }
    public Guid SalesOrderLineId { get; set; }
    public SalesOrderLine SalesOrderLine { get; set; } = null!;
    public Guid InventoryBalanceId { get; set; }
    public InventoryBalance InventoryBalance { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal PickedQuantity { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}
