using Microsoft.EntityFrameworkCore;
using Wms.Domain.Authentication;
using Wms.Domain.Audit;
using Wms.Domain.Catalog;
using Wms.Domain.Inbound;
using Wms.Domain.Inventory;
using InventoryCountEntity = Wms.Domain.InventoryCount.InventoryCount;
using InventoryCountLineEntity = Wms.Domain.InventoryCount.InventoryCountLine;
using Wms.Domain.Picking;
using Wms.Domain.Putaway;
using Wms.Domain.Replenishment;
using Wms.Domain.Sales;
using ShipmentEntity = Wms.Domain.Shipment.Shipment;
using ShipmentLineEntity = Wms.Domain.Shipment.ShipmentLine;
using Wms.Domain.Transfer;
using Wms.Domain.WarehouseStructure;

namespace Wms.Infrastructure.Persistence;

public sealed class WmsDbContext(DbContextOptions<WmsDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<InboundOrder> InboundOrders => Set<InboundOrder>();
    public DbSet<InboundOrderLine> InboundOrderLines => Set<InboundOrderLine>();
    public DbSet<Receipt> Receipts => Set<Receipt>();
    public DbSet<ReceiptLine> ReceiptLines => Set<ReceiptLine>();
    public DbSet<InventoryCountEntity> InventoryCounts => Set<InventoryCountEntity>();
    public DbSet<InventoryCountLineEntity> InventoryCountLines => Set<InventoryCountLineEntity>();
    public DbSet<PutawayTask> PutawayTasks => Set<PutawayTask>();
    public DbSet<PickingTask> PickingTasks => Set<PickingTask>();
    public DbSet<PickingTaskLine> PickingTaskLines => Set<PickingTaskLine>();
    public DbSet<ReplenishmentRule> ReplenishmentRules => Set<ReplenishmentRule>();
    public DbSet<ReplenishmentTask> ReplenishmentTasks => Set<ReplenishmentTask>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderLine> SalesOrderLines => Set<SalesOrderLine>();
    public DbSet<SalesOrderReservation> SalesOrderReservations => Set<SalesOrderReservation>();
    public DbSet<ShipmentEntity> Shipments => Set<ShipmentEntity>();
    public DbSet<ShipmentLineEntity> ShipmentLines => Set<ShipmentLineEntity>();
    public DbSet<TransferTask> TransferTasks => Set<TransferTask>();
    public DbSet<InventoryBalance> InventoryBalances => Set<InventoryBalance>();
    public DbSet<InventoryMovement> InventoryMovements => Set<InventoryMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WmsDbContext).Assembly);
    }
}
