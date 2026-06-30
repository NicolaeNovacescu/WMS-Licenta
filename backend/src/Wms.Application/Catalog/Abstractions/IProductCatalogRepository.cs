using Wms.Domain.Catalog;

namespace Wms.Application.Catalog.Abstractions;

public interface IProductCatalogRepository
{
    Task<IReadOnlyList<ProductCategory>> ListCategoriesAsync(CancellationToken cancellationToken);
    Task<ProductCategory?> FindCategoryByIdAsync(Guid categoryId, CancellationToken cancellationToken);
    void AddCategory(ProductCategory category);
    Task<IReadOnlyList<UnitOfMeasure>> ListUnitsOfMeasureAsync(CancellationToken cancellationToken);
    Task<UnitOfMeasure?> FindUnitOfMeasureByIdAsync(Guid unitOfMeasureId, CancellationToken cancellationToken);
    void AddUnitOfMeasure(UnitOfMeasure unitOfMeasure);
    Task<IReadOnlyList<Product>> ListProductsAsync(CancellationToken cancellationToken);
    Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<bool> ProductBarcodeExistsAsync(string barcode, Guid? excludedProductId, CancellationToken cancellationToken);
    void AddProduct(Product product);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
