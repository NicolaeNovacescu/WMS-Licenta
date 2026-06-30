namespace Wms.Domain.Sales;

public sealed class Customer
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public ICollection<SalesOrder> SalesOrders { get; set; } = [];
}
