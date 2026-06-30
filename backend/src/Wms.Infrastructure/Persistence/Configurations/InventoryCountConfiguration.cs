using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using InventoryCountEntity = Wms.Domain.InventoryCount.InventoryCount;
using Wms.Domain.InventoryCount;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class InventoryCountConfiguration : IEntityTypeConfiguration<InventoryCountEntity>
{
    public void Configure(EntityTypeBuilder<InventoryCountEntity> builder)
    {
        builder.ToTable(
            "inventory_counts",
            tableBuilder => tableBuilder.HasCheckConstraint(
                "CK_inventory_counts_status_supported",
                $"\"Status\" IN ('{InventoryCountStatus.Draft}', '{InventoryCountStatus.InProgress}', '{InventoryCountStatus.Completed}', '{InventoryCountStatus.Cancelled}')"));

        builder.HasKey(inventoryCount => inventoryCount.Id);

        builder.Property(inventoryCount => inventoryCount.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(inventoryCount => inventoryCount.CreatedAtUtc)
            .IsRequired();

        builder.HasMany(inventoryCount => inventoryCount.Lines)
            .WithOne(line => line.InventoryCount)
            .HasForeignKey(line => line.InventoryCountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(inventoryCount => inventoryCount.Status);
        builder.HasIndex(inventoryCount => inventoryCount.CreatedAtUtc);
    }
}
