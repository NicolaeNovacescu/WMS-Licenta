using Wms.Domain.Catalog;

namespace Wms.Domain.Sales;

public sealed class SalesOrderLine
{
    public Guid Id { get; set; }
    public Guid SalesOrderId { get; set; }
    public SalesOrder SalesOrder { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal OrderedQuantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal PickedQuantity { get; set; }
    public ICollection<SalesOrderReservation> Reservations { get; set; } = [];
}
