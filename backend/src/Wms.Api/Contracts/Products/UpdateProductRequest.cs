namespace Wms.Api.Contracts.Products;

public sealed record UpdateProductRequest(
    string Sku,
    string Barcode,
    string Name,
    string Description,
    Guid CategoryId,
    Guid UnitOfMeasureId,
    string ImageUrl,
    bool IsActive,
    decimal DefaultMinPickingThreshold,
    decimal DefaultTargetPickingQuantity);
