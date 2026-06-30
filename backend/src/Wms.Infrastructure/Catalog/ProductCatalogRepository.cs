using Microsoft.EntityFrameworkCore;
using Npgsql;
using Wms.Application.Catalog.Abstractions;
using Wms.Application.Catalog;
using Wms.Domain.Catalog;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Catalog;

public sealed class ProductCatalogRepository(WmsDbContext dbContext) : IProductCatalogRepository
{
    private const string ProductBarcodeUniqueIndexName = "IX_products_barcode_non_empty_unique";

    public async Task<IReadOnlyList<ProductCategory>> ListCategoriesAsync(CancellationToken cancellationToken) =>
        await dbContext.ProductCategories
            .OrderBy(category => category.Name)
            .ToArrayAsync(cancellationToken);

    public Task<ProductCategory?> FindCategoryByIdAsync(Guid categoryId, CancellationToken cancellationToken) =>
        dbContext.ProductCategories
            .SingleOrDefaultAsync(category => category.Id == categoryId, cancellationToken);

    public void AddCategory(ProductCategory category) => dbContext.ProductCategories.Add(category);

    public async Task<IReadOnlyList<UnitOfMeasure>> ListUnitsOfMeasureAsync(CancellationToken cancellationToken) =>
        await dbContext.UnitsOfMeasure
            .OrderBy(unitOfMeasure => unitOfMeasure.Name)
            .ToArrayAsync(cancellationToken);

    public Task<UnitOfMeasure?> FindUnitOfMeasureByIdAsync(Guid unitOfMeasureId, CancellationToken cancellationToken) =>
        dbContext.UnitsOfMeasure
            .SingleOrDefaultAsync(unitOfMeasure => unitOfMeasure.Id == unitOfMeasureId, cancellationToken);

    public void AddUnitOfMeasure(UnitOfMeasure unitOfMeasure) => dbContext.UnitsOfMeasure.Add(unitOfMeasure);

    public async Task<IReadOnlyList<Product>> ListProductsAsync(CancellationToken cancellationToken) =>
        await dbContext.Products
            .Include(product => product.Category)
            .Include(product => product.UnitOfMeasure)
            .OrderBy(product => product.Name)
            .ToArrayAsync(cancellationToken);

    public Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken) =>
        dbContext.Products
            .Include(product => product.Category)
            .Include(product => product.UnitOfMeasure)
            .SingleOrDefaultAsync(product => product.Id == productId, cancellationToken);

    public Task<bool> ProductBarcodeExistsAsync(
        string barcode,
        Guid? excludedProductId,
        CancellationToken cancellationToken) =>
        dbContext.Products.AnyAsync(
            product =>
                product.Barcode == barcode &&
                (!excludedProductId.HasValue || product.Id != excludedProductId.Value),
            cancellationToken);

    public void AddProduct(Product product) => dbContext.Products.Add(product);

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: ProductBarcodeUniqueIndexName,
            })
        {
            throw new DuplicateBarcodeException(innerException: exception);
        }
    }
}
