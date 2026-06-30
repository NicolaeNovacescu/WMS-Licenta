namespace Wms.Domain.Inbound;

public sealed class Supplier
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public ICollection<InboundOrder> InboundOrders { get; set; } = [];
}
