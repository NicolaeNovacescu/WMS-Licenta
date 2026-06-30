using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShipmentEntity = Wms.Domain.Shipment.Shipment;
using Wms.Domain.Shipment;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ShipmentConfiguration : IEntityTypeConfiguration<ShipmentEntity>
{
    public void Configure(EntityTypeBuilder<ShipmentEntity> builder)
    {
        builder.ToTable(
            "shipments",
            tableBuilder => tableBuilder.HasCheckConstraint(
                "CK_shipments_status_supported",
                $"\"Status\" IN ('{ShipmentStatus.Pending}', '{ShipmentStatus.InProgress}', '{ShipmentStatus.Completed}', '{ShipmentStatus.Cancelled}')"));

        builder.HasKey(shipment => shipment.Id);

        builder.Property(shipment => shipment.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(shipment => shipment.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(shipment => shipment.SalesOrder)
            .WithMany()
            .HasForeignKey(shipment => shipment.SalesOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(shipment => shipment.Lines)
            .WithOne(line => line.Shipment)
            .HasForeignKey(line => line.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(shipment => shipment.SalesOrderId);
        builder.HasIndex(shipment => shipment.Status);
        builder.HasIndex(shipment => shipment.CreatedAtUtc);
    }
}
