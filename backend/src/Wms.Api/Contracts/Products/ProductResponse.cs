namespace Wms.Api.Contracts.Products;

public sealed record ProductResponse(
    Guid Id,
    string Sku,
    string Barcode,
    string Name,
    string Description,
    Guid CategoryId,
    string CategoryName,
    Guid UnitOfMeasureId,
    string UnitOfMeasureName,
    string ImageUrl,
    bool IsActive,
    decimal DefaultMinPickingThreshold,
    decimal DefaultTargetPickingQuantity);
