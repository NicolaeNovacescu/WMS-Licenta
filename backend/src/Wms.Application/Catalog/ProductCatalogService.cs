using Wms.Application.Catalog.Abstractions;
using Wms.Application.Catalog.Models;
using Wms.Domain.Catalog;

namespace Wms.Application.Catalog;

public sealed class ProductCatalogService(IProductCatalogRepository repository)
{
    public async Task<IReadOnlyList<ProductCategoryDto>> ListCategoriesAsync(CancellationToken cancellationToken)
    {
        var categories = await repository.ListCategoriesAsync(cancellationToken);
        return categories
            .Select(category => new ProductCategoryDto(category.Id, category.Name))
            .ToArray();
    }

    public async Task<ProductCategoryDto> CreateCategoryAsync(
        CreateProductCategoryCommand command,
        CancellationToken cancellationToken)
    {
        var name = NormalizeRequired(command.Name, nameof(command.Name));

        var category = new ProductCategory
        {
            Id = Guid.NewGuid(),
            Name = name,
        };

        repository.AddCategory(category);
        await repository.SaveChangesAsync(cancellationToken);

        return new ProductCategoryDto(category.Id, category.Name);
    }

    public async Task<IReadOnlyList<UnitOfMeasureDto>> ListUnitsOfMeasureAsync(CancellationToken cancellationToken)
    {
        var units = await repository.ListUnitsOfMeasureAsync(cancellationToken);
        return units
            .Select(unit => new UnitOfMeasureDto(unit.Id, unit.Name))
            .ToArray();
    }

    public async Task<UnitOfMeasureDto> CreateUnitOfMeasureAsync(
        CreateUnitOfMeasureCommand command,
        CancellationToken cancellationToken)
    {
        var name = NormalizeRequired(command.Name, nameof(command.Name));

        var unitOfMeasure = new UnitOfMeasure
        {
            Id = Guid.NewGuid(),
            Name = name,
        };

        repository.AddUnitOfMeasure(unitOfMeasure);
        await repository.SaveChangesAsync(cancellationToken);

        return new UnitOfMeasureDto(unitOfMeasure.Id, unitOfMeasure.Name);
    }

    public async Task<IReadOnlyList<ProductDto>> ListProductsAsync(CancellationToken cancellationToken)
    {
        var products = await repository.ListProductsAsync(cancellationToken);
        return products
            .Select(MapProduct)
            .ToArray();
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await repository.FindProductByIdAsync(productId, cancellationToken);
        return product is null ? null : MapProduct(product);
    }

    public async Task<ProductDto> CreateProductAsync(
        CreateProductCommand command,
        CancellationToken cancellationToken)
    {
        var category = await repository.FindCategoryByIdAsync(command.CategoryId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product category '{command.CategoryId}' was not found.");

        var unitOfMeasure = await repository.FindUnitOfMeasureByIdAsync(command.UnitOfMeasureId, cancellationToken)
            ?? throw new KeyNotFoundException($"Unit of measure '{command.UnitOfMeasureId}' was not found.");

        ValidateThreshold(command.DefaultMinPickingThreshold, nameof(command.DefaultMinPickingThreshold));
        ValidateThreshold(command.DefaultTargetPickingQuantity, nameof(command.DefaultTargetPickingQuantity));
        var normalizedBarcode = NormalizeBarcode(command.Barcode, nameof(command.Barcode));

        await EnsureBarcodeIsUniqueAsync(normalizedBarcode, null, cancellationToken);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = NormalizeRequired(command.Sku, nameof(command.Sku)),
            Barcode = normalizedBarcode,
            Name = NormalizeRequired(command.Name, nameof(command.Name)),
            Description = NormalizeOptional(command.Description),
            CategoryId = category.Id,
            Category = category,
            UnitOfMeasureId = unitOfMeasure.Id,
            UnitOfMeasure = unitOfMeasure,
            ImageUrl = NormalizeOptional(command.ImageUrl),
            IsActive = command.IsActive,
            DefaultMinPickingThreshold = command.DefaultMinPickingThreshold,
            DefaultTargetPickingQuantity = command.DefaultTargetPickingQuantity,
        };

        repository.AddProduct(product);
        await repository.SaveChangesAsync(cancellationToken);

        return MapProduct(product);
    }

    public async Task<ProductDto> UpdateProductAsync(
        Guid productId,
        UpdateProductCommand command,
        CancellationToken cancellationToken)
    {
        var product = await repository.FindProductByIdAsync(productId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{productId}' was not found.");

        var category = await repository.FindCategoryByIdAsync(command.CategoryId, cancellationToken)
            ?? throw new KeyNotFoundException($"Product category '{command.CategoryId}' was not found.");

        var unitOfMeasure = await repository.FindUnitOfMeasureByIdAsync(command.UnitOfMeasureId, cancellationToken)
            ?? throw new KeyNotFoundException($"Unit of measure '{command.UnitOfMeasureId}' was not found.");

        ValidateThreshold(command.DefaultMinPickingThreshold, nameof(command.DefaultMinPickingThreshold));
        ValidateThreshold(command.DefaultTargetPickingQuantity, nameof(command.DefaultTargetPickingQuantity));
        var normalizedBarcode = NormalizeBarcode(command.Barcode, nameof(command.Barcode));

        await EnsureBarcodeIsUniqueAsync(normalizedBarcode, productId, cancellationToken);

        product.Sku = NormalizeRequired(command.Sku, nameof(command.Sku));
        product.Barcode = normalizedBarcode;
        product.Name = NormalizeRequired(command.Name, nameof(command.Name));
        product.Description = NormalizeOptional(command.Description);
        product.CategoryId = category.Id;
        product.Category = category;
        product.UnitOfMeasureId = unitOfMeasure.Id;
        product.UnitOfMeasure = unitOfMeasure;
        product.ImageUrl = NormalizeOptional(command.ImageUrl);
        product.IsActive = command.IsActive;
        product.DefaultMinPickingThreshold = command.DefaultMinPickingThreshold;
        product.DefaultTargetPickingQuantity = command.DefaultTargetPickingQuantity;

        await repository.SaveChangesAsync(cancellationToken);

        return MapProduct(product);
    }

    public async Task<bool> DeactivateProductAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await repository.FindProductByIdAsync(productId, cancellationToken);
        if (product is null)
        {
            return false;
        }

        product.IsActive = false;
        await repository.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ProductDto MapProduct(Product product) =>
        new(
            product.Id,
            product.Sku,
            product.Barcode,
            product.Name,
            product.Description,
            product.CategoryId,
            product.Category.Name,
            product.UnitOfMeasureId,
            product.UnitOfMeasure.Name,
            product.ImageUrl,
            product.IsActive,
            product.DefaultMinPickingThreshold,
            product.DefaultTargetPickingQuantity);

    private static string NormalizeRequired(string? value, string parameterName)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("A value is required.", parameterName);
        }

        return normalized;
    }

    private static string NormalizeOptional(string? value) => value?.Trim() ?? string.Empty;

    private static string NormalizeBarcode(string? value, string parameterName)
    {
        var normalized = value?.Trim() ?? string.Empty;

        if (normalized.Length > 100)
        {
            throw new ArgumentException("Barcode must be 100 characters or fewer.", parameterName);
        }

        return normalized;
    }

    private static void ValidateThreshold(decimal value, string parameterName)
    {
        if (value < 0)
        {
            throw new ArgumentException("Value must be zero or greater.", parameterName);
        }
    }

    private async Task EnsureBarcodeIsUniqueAsync(
        string barcode,
        Guid? excludedProductId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(barcode))
        {
            return;
        }

        if (await repository.ProductBarcodeExistsAsync(barcode, excludedProductId, cancellationToken))
        {
            throw new DuplicateBarcodeException(barcode);
        }
    }
}
