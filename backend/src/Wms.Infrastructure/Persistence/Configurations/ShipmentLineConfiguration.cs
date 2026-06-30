using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Shipment;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ShipmentLineConfiguration : IEntityTypeConfiguration<ShipmentLine>
{
    public void Configure(EntityTypeBuilder<ShipmentLine> builder)
    {
        builder.ToTable(
            "shipment_lines",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_shipment_lines_quantity_positive",
                    "\"QuantityToShip\" > 0");
                tableBuilder.HasCheckConstraint(
                    "CK_shipment_lines_shipped_non_negative",
                    "\"ShippedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_shipment_lines_shipped_not_greater_than_quantity",
                    "\"ShippedQuantity\" <= \"QuantityToShip\"");
            });

        builder.HasKey(line => line.Id);

        builder.Property(line => line.QuantityToShip)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(line => line.ShippedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(line => line.PickingTaskLine)
            .WithMany()
            .HasForeignKey(line => line.PickingTaskLineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(line => line.ShipmentId);
        builder.HasIndex(line => line.PickingTaskLineId);
        builder.HasIndex(line => new { line.ShipmentId, line.PickingTaskLineId })
            .IsUnique();
    }
}
