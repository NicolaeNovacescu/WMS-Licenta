using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Sales;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class SalesOrderLineConfiguration : IEntityTypeConfiguration<SalesOrderLine>
{
    public void Configure(EntityTypeBuilder<SalesOrderLine> builder)
    {
        builder.ToTable(
            "sales_order_lines",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_sales_order_lines_ordered_positive",
                    "\"OrderedQuantity\" > 0");
                tableBuilder.HasCheckConstraint(
                    "CK_sales_order_lines_reserved_non_negative",
                    "\"ReservedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_sales_order_lines_picked_non_negative",
                    "\"PickedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_sales_order_lines_committed_not_greater_than_ordered",
                    "\"ReservedQuantity\" + \"PickedQuantity\" <= \"OrderedQuantity\"");
            });

        builder.HasKey(line => line.Id);

        builder.Property(line => line.OrderedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(line => line.ReservedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(line => line.PickedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(line => line.Product)
            .WithMany()
            .HasForeignKey(line => line.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(line => line.Reservations)
            .WithOne(reservation => reservation.SalesOrderLine)
            .HasForeignKey(reservation => reservation.SalesOrderLineId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(line => line.SalesOrderId);
        builder.HasIndex(line => line.ProductId);
    }
}
