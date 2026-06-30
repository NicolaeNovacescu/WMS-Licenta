using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Picking;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class PickingTaskLineConfiguration : IEntityTypeConfiguration<PickingTaskLine>
{
    public void Configure(EntityTypeBuilder<PickingTaskLine> builder)
    {
        builder.ToTable(
            "picking_task_lines",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_picking_task_lines_quantity_positive",
                    "\"QuantityToPick\" > 0");
                tableBuilder.HasCheckConstraint(
                    "CK_picking_task_lines_picked_non_negative",
                    "\"PickedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_picking_task_lines_picked_not_greater_than_quantity",
                    "\"PickedQuantity\" <= \"QuantityToPick\"");
            });

        builder.HasKey(line => line.Id);

        builder.Property(line => line.QuantityToPick)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(line => line.PickedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(line => line.SalesOrderLine)
            .WithMany()
            .HasForeignKey(line => line.SalesOrderLineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(line => line.SalesOrderReservation)
            .WithMany()
            .HasForeignKey(line => line.SalesOrderReservationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(line => line.InventoryBalance)
            .WithMany()
            .HasForeignKey(line => line.InventoryBalanceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(line => line.PickingTaskId);
        builder.HasIndex(line => line.SalesOrderLineId);
        builder.HasIndex(line => line.SalesOrderReservationId);
        builder.HasIndex(line => line.InventoryBalanceId);
    }
}
