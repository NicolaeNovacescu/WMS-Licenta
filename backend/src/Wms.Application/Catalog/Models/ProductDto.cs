namespace Wms.Application.Catalog.Models;

public sealed record ProductDto(
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
