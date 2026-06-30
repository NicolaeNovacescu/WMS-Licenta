using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Picking;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class PickingTaskConfiguration : IEntityTypeConfiguration<PickingTask>
{
    public void Configure(EntityTypeBuilder<PickingTask> builder)
    {
        builder.ToTable(
            "picking_tasks",
            tableBuilder => tableBuilder.HasCheckConstraint(
                "CK_picking_tasks_status_supported",
                $"\"Status\" IN ('{PickingTaskStatus.Pending}', '{PickingTaskStatus.InProgress}', '{PickingTaskStatus.Completed}', '{PickingTaskStatus.Cancelled}')"));

        builder.HasKey(task => task.Id);

        builder.Property(task => task.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(task => task.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(task => task.SalesOrder)
            .WithMany()
            .HasForeignKey(task => task.SalesOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(task => task.Lines)
            .WithOne(line => line.PickingTask)
            .HasForeignKey(line => line.PickingTaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(task => task.SalesOrderId);
        builder.HasIndex(task => task.Status);
        builder.HasIndex(task => task.CreatedAtUtc);
    }
}
