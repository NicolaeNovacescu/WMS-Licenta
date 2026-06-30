namespace Wms.Application.Catalog.Models;

public sealed record CreateProductCommand(
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
