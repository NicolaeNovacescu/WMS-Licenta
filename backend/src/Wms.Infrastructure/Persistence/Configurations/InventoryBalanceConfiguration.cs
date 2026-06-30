using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Inventory;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class InventoryBalanceConfiguration : IEntityTypeConfiguration<InventoryBalance>
{
    public void Configure(EntityTypeBuilder<InventoryBalance> builder)
    {
        builder.ToTable(
            "inventory_balances",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_balances_reserved_non_negative",
                    "\"ReservedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_balances_picked_non_negative",
                    "\"PickedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_balances_committed_not_greater_than_on_hand",
                    "\"ReservedQuantity\" + \"PickedQuantity\" <= \"OnHandQuantity\"");
            });

        builder.HasKey(balance => balance.Id);

        builder.Property(balance => balance.OnHandQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(balance => balance.ReservedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(balance => balance.PickedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(balance => balance.UpdatedAtUtc)
            .IsRequired();

        builder.Ignore(balance => balance.AvailableQuantity);

        builder.HasOne(balance => balance.Product)
            .WithMany(product => product.InventoryBalances)
            .HasForeignKey(balance => balance.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(balance => balance.Location)
            .WithMany(location => location.InventoryBalances)
            .HasForeignKey(balance => balance.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(balance => new { balance.ProductId, balance.LocationId })
            .IsUnique();

        builder.HasIndex(balance => balance.LocationId);
    }
}
