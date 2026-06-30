using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Sales;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class SalesOrderReservationConfiguration : IEntityTypeConfiguration<SalesOrderReservation>
{
    public void Configure(EntityTypeBuilder<SalesOrderReservation> builder)
    {
        builder.ToTable(
            "sales_order_reservations",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_sales_order_reservations_quantity_non_negative",
                    "\"Quantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_sales_order_reservations_picked_non_negative",
                    "\"PickedQuantity\" >= 0");
            });

        builder.HasKey(reservation => reservation.Id);

        builder.Property(reservation => reservation.Quantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(reservation => reservation.PickedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(reservation => reservation.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(reservation => reservation.InventoryBalance)
            .WithMany()
            .HasForeignKey(reservation => reservation.InventoryBalanceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(reservation => reservation.SalesOrderLineId);
        builder.HasIndex(reservation => reservation.InventoryBalanceId);
        builder.HasIndex(reservation => new { reservation.SalesOrderLineId, reservation.InventoryBalanceId })
            .IsUnique();
    }
}
