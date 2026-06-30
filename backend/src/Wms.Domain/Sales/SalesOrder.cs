namespace Wms.Domain.Sales;

public sealed class SalesOrder
{
    public Guid Id { get; set; }
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string Status { get; set; } = SalesOrderStatus.Draft;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public DateTimeOffset? ConfirmedAtUtc { get; set; }
    public DateTimeOffset? CancelledAtUtc { get; set; }
    public ICollection<SalesOrderLine> Lines { get; set; } = [];
}
