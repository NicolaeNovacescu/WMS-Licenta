using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wms.Domain.Catalog;
using Wms.Domain.WarehouseStructure;

namespace Wms.Infrastructure.Persistence.Development;

public static class DevelopmentMasterDataSeeder
{
    private static readonly ProductCategorySeed[] ProductCategories =
    [
        new("Finished Goods"),
        new("Raw Materials"),
    ];

    private static readonly UnitOfMeasureSeed[] UnitsOfMeasure =
    [
        new("Piece"),
        new("Box"),
    ];

    private static readonly ProductSeed[] Products =
    [
        new(
            "FG-1000",
            "5940000000011",
            "Demo Finished Product",
            "Development demo finished-good item for catalog testing.",
            "Finished Goods",
            "Piece",
            "https://example.local/images/demo-finished-product.png",
            true,
            10m,
            30m),
        new(
            "RM-2000",
            "5940000000028",
            "Demo Raw Material",
            "Development demo raw-material item for catalog testing.",
            "Raw Materials",
            "Box",
            "https://example.local/images/demo-raw-material.png",
            true,
            5m,
            15m),
    ];

    private static readonly WarehouseSeed[] Warehouses =
    [
        new("MAIN", "Main Warehouse", true),
    ];

    private static readonly ZoneSeed[] Zones =
    [
        new("MAIN", "RECV", "Receiving", true),
        new("MAIN", "PICK", "Picking", true),
        new("MAIN", "STAGE", "Staging", true),
    ];

    private static readonly LocationSeed[] Locations =
    [
        new("MAIN", "RECV", "REC-A-01", "Receiving A-01", LocationType.Receiving, true, false, 0, 0),
        new("MAIN", "PICK", "PICK-A-01", "Picking A-01", LocationType.Picking, true, false, 1, 0),
        new("MAIN", "STAGE", "STAGE-A-02", "Staging A-02", LocationType.Staging, true, false, 2, 2),
        new("MAIN", "STAGE", "STAGE-B-01", "Staging B-01", LocationType.Staging, true, true, 2, 1),
    ];

    public static async Task SeedAsync(
        WmsDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var categoriesByName = (await dbContext.ProductCategories
                .ToArrayAsync(cancellationToken))
            .GroupBy(category => category.Name, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in ProductCategories)
        {
            if (!categoriesByName.TryGetValue(definition.Name, out var category))
            {
                category = new ProductCategory
                {
                    Id = Guid.NewGuid(),
                    Name = definition.Name,
                };

                dbContext.ProductCategories.Add(category);
                categoriesByName[definition.Name] = category;
            }
            else
            {
                category.Name = definition.Name;
            }
        }

        var unitsByName = (await dbContext.UnitsOfMeasure
                .ToArrayAsync(cancellationToken))
            .GroupBy(unit => unit.Name, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in UnitsOfMeasure)
        {
            if (!unitsByName.TryGetValue(definition.Name, out var unit))
            {
                unit = new UnitOfMeasure
                {
                    Id = Guid.NewGuid(),
                    Name = definition.Name,
                };

                dbContext.UnitsOfMeasure.Add(unit);
                unitsByName[definition.Name] = unit;
            }
            else
            {
                unit.Name = definition.Name;
            }
        }

        var productsBySku = (await dbContext.Products
                .Include(product => product.Category)
                .Include(product => product.UnitOfMeasure)
                .ToArrayAsync(cancellationToken))
            .GroupBy(product => product.Sku, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in Products)
        {
            var category = categoriesByName[definition.CategoryName];
            var unitOfMeasure = unitsByName[definition.UnitOfMeasureName];

            if (!productsBySku.TryGetValue(definition.Sku, out var product))
            {
                product = new Product
                {
                    Id = Guid.NewGuid(),
                    Sku = definition.Sku,
                };

                dbContext.Products.Add(product);
                productsBySku[definition.Sku] = product;
            }

            product.Barcode = definition.Barcode;
            product.Name = definition.Name;
            product.Description = definition.Description;
            product.CategoryId = category.Id;
            product.Category = category;
            product.UnitOfMeasureId = unitOfMeasure.Id;
            product.UnitOfMeasure = unitOfMeasure;
            product.ImageUrl = definition.ImageUrl;
            product.IsActive = definition.IsActive;
            product.DefaultMinPickingThreshold = definition.DefaultMinPickingThreshold;
            product.DefaultTargetPickingQuantity = definition.DefaultTargetPickingQuantity;
        }

        var warehousesByCode = (await dbContext.Warehouses
                .ToArrayAsync(cancellationToken))
            .GroupBy(warehouse => warehouse.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in Warehouses)
        {
            if (!warehousesByCode.TryGetValue(definition.Code, out var warehouse))
            {
                warehouse = new Warehouse
                {
                    Id = Guid.NewGuid(),
                    Code = definition.Code,
                };

                dbContext.Warehouses.Add(warehouse);
                warehousesByCode[definition.Code] = warehouse;
            }

            warehouse.Name = definition.Name;
            warehouse.IsActive = definition.IsActive;
        }

        var zones = await dbContext.Zones
            .Include(zone => zone.Warehouse)
            .ToArrayAsync(cancellationToken);

        var zonesByWarehouseAndCode = zones
            .GroupBy(zone => ComposeKey(zone.Warehouse.Code, zone.Code), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in Zones)
        {
            var warehouse = warehousesByCode[definition.WarehouseCode];
            var zoneKey = ComposeKey(definition.WarehouseCode, definition.Code);

            if (!zonesByWarehouseAndCode.TryGetValue(zoneKey, out var zone))
            {
                zone = new Zone
                {
                    Id = Guid.NewGuid(),
                    WarehouseId = warehouse.Id,
                    Warehouse = warehouse,
                    Code = definition.Code,
                };

                dbContext.Zones.Add(zone);
                zonesByWarehouseAndCode[zoneKey] = zone;
            }

            zone.WarehouseId = warehouse.Id;
            zone.Warehouse = warehouse;
            zone.Name = definition.Name;
            zone.IsActive = definition.IsActive;
        }

        var locations = await dbContext.Locations
            .Include(location => location.Warehouse)
            .Include(location => location.Zone)
            .ThenInclude(zone => zone.Warehouse)
            .ToArrayAsync(cancellationToken);

        var locationsByWarehouseAndCode = locations.ToDictionary(
            location => ComposeKey(location.Warehouse.Code, location.Code),
            StringComparer.OrdinalIgnoreCase);

        foreach (var definition in Locations)
        {
            var warehouse = warehousesByCode[definition.WarehouseCode];
            var zone = zonesByWarehouseAndCode[ComposeKey(definition.WarehouseCode, definition.ZoneCode)];
            var locationKey = ComposeKey(definition.WarehouseCode, definition.Code);

            if (!locationsByWarehouseAndCode.TryGetValue(locationKey, out var location))
            {
                location = new Location
                {
                    Id = Guid.NewGuid(),
                    WarehouseId = warehouse.Id,
                    Warehouse = warehouse,
                    Code = definition.Code,
                };

                dbContext.Locations.Add(location);
                locationsByWarehouseAndCode[locationKey] = location;
            }

            location.WarehouseId = warehouse.Id;
            location.Warehouse = warehouse;
            location.ZoneId = zone.Id;
            location.Zone = zone;
            location.Name = definition.Name;
            location.LocationType = definition.LocationType;
            location.IsActive = definition.IsActive;
            location.IsBlocked = definition.IsBlocked;
            location.MapRow = definition.MapRow;
            location.MapColumn = definition.MapColumn;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Development master data seed ensured {CategoryCount} categories, {UnitCount} units, {ProductCount} products, {WarehouseCount} warehouses, {ZoneCount} zones, and {LocationCount} locations.",
            ProductCategories.Length,
            UnitsOfMeasure.Length,
            Products.Length,
            Warehouses.Length,
            Zones.Length,
            Locations.Length);
    }

    private static string ComposeKey(string left, string right) => $"{left}::{right}";

    private sealed record ProductCategorySeed(string Name);
    private sealed record UnitOfMeasureSeed(string Name);
    private sealed record ProductSeed(
        string Sku,
        string Barcode,
        string Name,
        string Description,
        string CategoryName,
        string UnitOfMeasureName,
        string ImageUrl,
        bool IsActive,
        decimal DefaultMinPickingThreshold,
        decimal DefaultTargetPickingQuantity);
    private sealed record WarehouseSeed(string Code, string Name, bool IsActive);
    private sealed record ZoneSeed(string WarehouseCode, string Code, string Name, bool IsActive);
    private sealed record LocationSeed(
        string WarehouseCode,
        string ZoneCode,
        string Code,
        string Name,
        string LocationType,
        bool IsActive,
        bool IsBlocked,
        int MapRow,
        int MapColumn);
}
