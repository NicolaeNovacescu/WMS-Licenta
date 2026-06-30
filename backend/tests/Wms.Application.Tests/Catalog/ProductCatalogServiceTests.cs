using Wms.Application.Catalog;
using Wms.Application.Catalog.Abstractions;
using Wms.Application.Catalog.Models;
using Wms.Domain.Catalog;
using Xunit;

namespace Wms.Application.Tests.Catalog;

public sealed class ProductCatalogServiceTests
{
    [Fact]
    public async Task CreateProductAsync_TrimsBarcodeBeforeSaving()
    {
        var repository = new InMemoryProductCatalogRepository();
        var category = repository.SeedCategory("Finished Goods");
        var unit = repository.SeedUnitOfMeasure("Piece");
        var service = new ProductCatalogService(repository);

        var result = await service.CreateProductAsync(
            new CreateProductCommand(
                "FG-1000",
                " 5940000000011 ",
                "Demo Finished Product",
                "Description",
                category.Id,
                unit.Id,
                string.Empty,
                true,
                10m,
                30m),
            CancellationToken.None);

        Assert.Equal("5940000000011", result.Barcode);
        Assert.Equal("5940000000011", repository.Products.Single().Barcode);
    }

    [Fact]
    public async Task CreateProductAsync_AllowsBlankBarcode()
    {
        var repository = new InMemoryProductCatalogRepository();
        var category = repository.SeedCategory("Finished Goods");
        var unit = repository.SeedUnitOfMeasure("Piece");
        var service = new ProductCatalogService(repository);

        var result = await service.CreateProductAsync(
            new CreateProductCommand(
                "FG-1000",
                "   ",
                "Demo Finished Product",
                "Description",
                category.Id,
                unit.Id,
                string.Empty,
                true,
                10m,
                30m),
            CancellationToken.None);

        Assert.Equal(string.Empty, result.Barcode);
        Assert.Equal(string.Empty, repository.Products.Single().Barcode);
    }

    [Fact]
    public async Task CreateProductAsync_RejectsDuplicateNonEmptyBarcode()
    {
        var repository = new InMemoryProductCatalogRepository();
        var category = repository.SeedCategory("Finished Goods");
        var unit = repository.SeedUnitOfMeasure("Piece");
        repository.SeedProduct("FG-1000", "5940000000011", category, unit);
        var service = new ProductCatalogService(repository);

        var exception = await Assert.ThrowsAsync<DuplicateBarcodeException>(() =>
            service.CreateProductAsync(
                new CreateProductCommand(
                    "FG-1001",
                    " 5940000000011 ",
                    "Another Product",
                    "Description",
                    category.Id,
                    unit.Id,
                    string.Empty,
                    true,
                    5m,
                    15m),
                CancellationToken.None));

        Assert.Contains("5940000000011", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task UpdateProductAsync_RejectsBarcodeAssignedToAnotherProduct()
    {
        var repository = new InMemoryProductCatalogRepository();
        var category = repository.SeedCategory("Finished Goods");
        var unit = repository.SeedUnitOfMeasure("Piece");
        var firstProduct = repository.SeedProduct("FG-1000", "5940000000011", category, unit);
        var secondProduct = repository.SeedProduct("FG-1001", string.Empty, category, unit);
        var service = new ProductCatalogService(repository);

        var exception = await Assert.ThrowsAsync<DuplicateBarcodeException>(() =>
            service.UpdateProductAsync(
                secondProduct.Id,
                new UpdateProductCommand(
                    secondProduct.Sku,
                    "5940000000011",
                    secondProduct.Name,
                    secondProduct.Description,
                    category.Id,
                    unit.Id,
                    secondProduct.ImageUrl,
                    secondProduct.IsActive,
                    secondProduct.DefaultMinPickingThreshold,
                    secondProduct.DefaultTargetPickingQuantity),
                CancellationToken.None));

        Assert.Contains(firstProduct.Barcode, exception.Message, StringComparison.Ordinal);
    }

    private sealed class InMemoryProductCatalogRepository : IProductCatalogRepository
    {
        private readonly List<ProductCategory> _categories = [];
        private readonly List<UnitOfMeasure> _unitsOfMeasure = [];
        private readonly List<Product> _products = [];

        public IReadOnlyList<Product> Products => _products;

        public Task<IReadOnlyList<ProductCategory>> ListCategoriesAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ProductCategory>>(_categories.OrderBy(category => category.Name).ToArray());

        public Task<ProductCategory?> FindCategoryByIdAsync(Guid categoryId, CancellationToken cancellationToken) =>
            Task.FromResult(_categories.SingleOrDefault(category => category.Id == categoryId));

        public void AddCategory(ProductCategory category) => _categories.Add(category);

        public Task<IReadOnlyList<UnitOfMeasure>> ListUnitsOfMeasureAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<UnitOfMeasure>>(_unitsOfMeasure.OrderBy(unit => unit.Name).ToArray());

        public Task<UnitOfMeasure?> FindUnitOfMeasureByIdAsync(Guid unitOfMeasureId, CancellationToken cancellationToken) =>
            Task.FromResult(_unitsOfMeasure.SingleOrDefault(unit => unit.Id == unitOfMeasureId));

        public void AddUnitOfMeasure(UnitOfMeasure unitOfMeasure) => _unitsOfMeasure.Add(unitOfMeasure);

        public Task<IReadOnlyList<Product>> ListProductsAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Product>>(_products.OrderBy(product => product.Name).ToArray());

        public Task<Product?> FindProductByIdAsync(Guid productId, CancellationToken cancellationToken) =>
            Task.FromResult(_products.SingleOrDefault(product => product.Id == productId));

        public Task<bool> ProductBarcodeExistsAsync(
            string barcode,
            Guid? excludedProductId,
            CancellationToken cancellationToken) =>
            Task.FromResult(
                _products.Any(product =>
                    string.Equals(product.Barcode, barcode, StringComparison.Ordinal) &&
                    (!excludedProductId.HasValue || product.Id != excludedProductId.Value)));

        public void AddProduct(Product product) => _products.Add(product);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public ProductCategory SeedCategory(string name)
        {
            var category = new ProductCategory
            {
                Id = Guid.NewGuid(),
                Name = name,
            };

            _categories.Add(category);
            return category;
        }

        public UnitOfMeasure SeedUnitOfMeasure(string name)
        {
            var unitOfMeasure = new UnitOfMeasure
            {
                Id = Guid.NewGuid(),
                Name = name,
            };

            _unitsOfMeasure.Add(unitOfMeasure);
            return unitOfMeasure;
        }

        public Product SeedProduct(
            string sku,
            string barcode,
            ProductCategory category,
            UnitOfMeasure unitOfMeasure)
        {
            var product = new Product
            {
                Id = Guid.NewGuid(),
                Sku = sku,
                Barcode = barcode,
                Name = $"{sku} Name",
                Description = "Description",
                CategoryId = category.Id,
                Category = category,
                UnitOfMeasureId = unitOfMeasure.Id,
                UnitOfMeasure = unitOfMeasure,
                ImageUrl = string.Empty,
                IsActive = true,
                DefaultMinPickingThreshold = 1m,
                DefaultTargetPickingQuantity = 2m,
            };

            _products.Add(product);
            return product;
        }
    }
}
