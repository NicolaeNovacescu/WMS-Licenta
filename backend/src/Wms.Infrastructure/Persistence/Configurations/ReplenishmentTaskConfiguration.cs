using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Replenishment;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ReplenishmentTaskConfiguration : IEntityTypeConfiguration<ReplenishmentTask>
{
    public void Configure(EntityTypeBuilder<ReplenishmentTask> builder)
    {
        builder.ToTable(
            "replenishment_tasks",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_replenishment_tasks_quantity_positive",
                    "\"Quantity\" > 0");
                tableBuilder.HasCheckConstraint(
                    "CK_replenishment_tasks_status_supported",
                    $"\"Status\" IN ('{ReplenishmentTaskStatus.Pending}', '{ReplenishmentTaskStatus.InProgress}', '{ReplenishmentTaskStatus.Completed}', '{ReplenishmentTaskStatus.Cancelled}')");
                tableBuilder.HasCheckConstraint(
                    "CK_replenishment_tasks_source_target_different",
                    "\"SourceLocationId\" <> \"TargetLocationId\"");
            });

        builder.HasKey(replenishmentTask => replenishmentTask.Id);

        builder.Property(replenishmentTask => replenishmentTask.Quantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(replenishmentTask => replenishmentTask.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(replenishmentTask => replenishmentTask.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(replenishmentTask => replenishmentTask.ReplenishmentRule)
            .WithMany()
            .HasForeignKey(replenishmentTask => replenishmentTask.ReplenishmentRuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(replenishmentTask => replenishmentTask.Product)
            .WithMany()
            .HasForeignKey(replenishmentTask => replenishmentTask.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(replenishmentTask => replenishmentTask.SourceLocation)
            .WithMany()
            .HasForeignKey(replenishmentTask => replenishmentTask.SourceLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(replenishmentTask => replenishmentTask.TargetLocation)
            .WithMany()
            .HasForeignKey(replenishmentTask => replenishmentTask.TargetLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(replenishmentTask => replenishmentTask.Status);
        builder.HasIndex(replenishmentTask => replenishmentTask.ReplenishmentRuleId);
        builder.HasIndex(replenishmentTask => replenishmentTask.ProductId);
        builder.HasIndex(replenishmentTask => replenishmentTask.SourceLocationId);
        builder.HasIndex(replenishmentTask => replenishmentTask.TargetLocationId);
        builder.HasIndex(replenishmentTask => replenishmentTask.CreatedAtUtc);
    }
}
