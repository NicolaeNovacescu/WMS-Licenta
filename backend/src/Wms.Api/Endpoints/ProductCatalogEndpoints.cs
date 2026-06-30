using Wms.Api.Contracts.ProductCategories;
using Wms.Api.Contracts.Products;
using Wms.Api.Contracts.UnitsOfMeasure;
using Wms.Application.Catalog;
using Wms.Application.Catalog.Models;

namespace Wms.Api.Endpoints;

public static class ProductCatalogEndpoints
{
    private static readonly string[] ProductReadRoles = ["Admin", "Warehouse", "Sales"];

    public static IEndpointRouteBuilder MapProductCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        var categoryGroup = app.MapGroup("/api/product-categories")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        categoryGroup.MapGet(string.Empty, GetCategoriesAsync);
        categoryGroup.MapPost(string.Empty, CreateCategoryAsync);

        var unitGroup = app.MapGroup("/api/units-of-measure")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        unitGroup.MapGet(string.Empty, GetUnitsOfMeasureAsync);
        unitGroup.MapPost(string.Empty, CreateUnitOfMeasureAsync);

        var productsGroup = app.MapGroup("/api/products");

        productsGroup.MapGet(string.Empty, GetProductsAsync)
            .RequireAuthorization(policy => policy.RequireRole(ProductReadRoles));
        productsGroup.MapGet("/{id:guid}", GetProductByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole(ProductReadRoles));
        productsGroup.MapPost(string.Empty, CreateProductAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        productsGroup.MapPut("/{id:guid}", UpdateProductAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        productsGroup.MapPatch("/{id:guid}/deactivate", DeactivateProductAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        return app;
    }

    private static async Task<IResult> GetCategoriesAsync(
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        var categories = await service.ListCategoriesAsync(cancellationToken);
        return Results.Ok(categories.Select(category => new ProductCategoryResponse(category.Id, category.Name)));
    }

    private static async Task<IResult> CreateCategoryAsync(
        CreateProductCategoryRequest request,
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var category = await service.CreateCategoryAsync(
                new CreateProductCategoryCommand(request.Name),
                cancellationToken);

            return Results.Created(
                $"/api/product-categories/{category.Id}",
                new ProductCategoryResponse(category.Id, category.Name));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
    }

    private static async Task<IResult> GetUnitsOfMeasureAsync(
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        var units = await service.ListUnitsOfMeasureAsync(cancellationToken);
        return Results.Ok(units.Select(unit => new UnitOfMeasureResponse(unit.Id, unit.Name)));
    }

    private static async Task<IResult> CreateUnitOfMeasureAsync(
        CreateUnitOfMeasureRequest request,
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var unit = await service.CreateUnitOfMeasureAsync(
                new CreateUnitOfMeasureCommand(request.Name),
                cancellationToken);

            return Results.Created(
                $"/api/units-of-measure/{unit.Id}",
                new UnitOfMeasureResponse(unit.Id, unit.Name));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
    }

    private static async Task<IResult> GetProductsAsync(
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        var products = await service.ListProductsAsync(cancellationToken);
        return Results.Ok(products.Select(ToResponse));
    }

    private static async Task<IResult> GetProductByIdAsync(
        Guid id,
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        var product = await service.GetProductByIdAsync(id, cancellationToken);
        return product is null ? Results.NotFound() : Results.Ok(ToResponse(product));
    }

    private static async Task<IResult> CreateProductAsync(
        CreateProductRequest request,
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var product = await service.CreateProductAsync(
                new CreateProductCommand(
                    request.Sku,
                    request.Barcode,
                    request.Name,
                    request.Description,
                    request.CategoryId,
                    request.UnitOfMeasureId,
                    request.ImageUrl,
                    request.IsActive,
                    request.DefaultMinPickingThreshold,
                    request.DefaultTargetPickingQuantity),
                cancellationToken);

            return Results.Created($"/api/products/{product.Id}", ToResponse(product));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (DuplicateBarcodeException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
    }

    private static async Task<IResult> UpdateProductAsync(
        Guid id,
        UpdateProductRequest request,
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var product = await service.UpdateProductAsync(
                id,
                new UpdateProductCommand(
                    request.Sku,
                    request.Barcode,
                    request.Name,
                    request.Description,
                    request.CategoryId,
                    request.UnitOfMeasureId,
                    request.ImageUrl,
                    request.IsActive,
                    request.DefaultMinPickingThreshold,
                    request.DefaultTargetPickingQuantity),
                cancellationToken);

            return Results.Ok(ToResponse(product));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (DuplicateBarcodeException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
    }

    private static async Task<IResult> DeactivateProductAsync(
        Guid id,
        ProductCatalogService service,
        CancellationToken cancellationToken)
    {
        var deactivated = await service.DeactivateProductAsync(id, cancellationToken);
        return deactivated ? Results.NoContent() : Results.NotFound();
    }

    private static ProductResponse ToResponse(ProductDto product) =>
        new(
            product.Id,
            product.Sku,
            product.Barcode,
            product.Name,
            product.Description,
            product.CategoryId,
            product.CategoryName,
            product.UnitOfMeasureId,
            product.UnitOfMeasureName,
            product.ImageUrl,
            product.IsActive,
            product.DefaultMinPickingThreshold,
            product.DefaultTargetPickingQuantity);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message]
        });
}
