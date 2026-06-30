using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using InventoryCountLineEntity = Wms.Domain.InventoryCount.InventoryCountLine;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class InventoryCountLineConfiguration : IEntityTypeConfiguration<InventoryCountLineEntity>
{
    public void Configure(EntityTypeBuilder<InventoryCountLineEntity> builder)
    {
        builder.ToTable(
            "inventory_count_lines",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_count_lines_expected_non_negative",
                    "\"ExpectedSystemQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_count_lines_counted_non_negative",
                    "\"CountedQuantity\" IS NULL OR \"CountedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_count_lines_variance_pairing",
                    "(\"CountedQuantity\" IS NULL AND \"VarianceQuantity\" IS NULL) OR (\"CountedQuantity\" IS NOT NULL AND \"VarianceQuantity\" = (\"CountedQuantity\" - \"ExpectedSystemQuantity\"))");
            });

        builder.HasKey(line => line.Id);

        builder.Property(line => line.ExpectedSystemQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(line => line.CountedQuantity)
            .HasPrecision(18, 2);

        builder.Property(line => line.VarianceQuantity)
            .HasPrecision(18, 2);

        builder.HasOne(line => line.Product)
            .WithMany()
            .HasForeignKey(line => line.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(line => line.Location)
            .WithMany()
            .HasForeignKey(line => line.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(line => line.InventoryBalance)
            .WithMany()
            .HasForeignKey(line => line.InventoryBalanceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(line => new { line.InventoryCountId, line.ProductId, line.LocationId })
            .IsUnique();

        builder.HasIndex(line => line.ProductId);
        builder.HasIndex(line => line.LocationId);
        builder.HasIndex(line => line.InventoryBalanceId);
    }
}
