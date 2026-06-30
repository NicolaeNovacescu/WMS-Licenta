using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Putaway;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class PutawayTaskConfiguration : IEntityTypeConfiguration<PutawayTask>
{
    public void Configure(EntityTypeBuilder<PutawayTask> builder)
    {
        builder.ToTable(
            "putaway_tasks",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_putaway_tasks_quantity_positive",
                    "\"Quantity\" > 0");
                tableBuilder.HasCheckConstraint(
                    "CK_putaway_tasks_status_supported",
                    $"\"Status\" IN ('{PutawayTaskStatus.Pending}', '{PutawayTaskStatus.InProgress}', '{PutawayTaskStatus.Completed}', '{PutawayTaskStatus.Cancelled}')");
                tableBuilder.HasCheckConstraint(
                    "CK_putaway_tasks_source_destination_different",
                    "\"SourceLocationId\" <> \"DestinationLocationId\"");
            });

        builder.HasKey(putawayTask => putawayTask.Id);

        builder.Property(putawayTask => putawayTask.Quantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(putawayTask => putawayTask.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(putawayTask => putawayTask.Notes)
            .HasMaxLength(512);

        builder.Property(putawayTask => putawayTask.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(putawayTask => putawayTask.Product)
            .WithMany()
            .HasForeignKey(putawayTask => putawayTask.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(putawayTask => putawayTask.SourceLocation)
            .WithMany()
            .HasForeignKey(putawayTask => putawayTask.SourceLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(putawayTask => putawayTask.DestinationLocation)
            .WithMany()
            .HasForeignKey(putawayTask => putawayTask.DestinationLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(putawayTask => putawayTask.ReceiptLine)
            .WithMany()
            .HasForeignKey(putawayTask => putawayTask.ReceiptLineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(putawayTask => putawayTask.Status);
        builder.HasIndex(putawayTask => putawayTask.ProductId);
        builder.HasIndex(putawayTask => putawayTask.SourceLocationId);
        builder.HasIndex(putawayTask => putawayTask.DestinationLocationId);
        builder.HasIndex(putawayTask => putawayTask.ReceiptLineId);
        builder.HasIndex(putawayTask => putawayTask.CreatedAtUtc);
    }
}
