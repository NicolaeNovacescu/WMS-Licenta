namespace Wms.Domain.Catalog;

public sealed class ProductCategory
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Product> Products { get; } = [];
}
