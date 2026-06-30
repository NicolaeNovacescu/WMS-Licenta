using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Transfer;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class TransferTaskConfiguration : IEntityTypeConfiguration<TransferTask>
{
    public void Configure(EntityTypeBuilder<TransferTask> builder)
    {
        builder.ToTable(
            "transfer_tasks",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_transfer_tasks_quantity_positive",
                    "\"Quantity\" > 0");
                tableBuilder.HasCheckConstraint(
                    "CK_transfer_tasks_status_supported",
                    $"\"Status\" IN ('{TransferTaskStatus.Pending}', '{TransferTaskStatus.InProgress}', '{TransferTaskStatus.Completed}', '{TransferTaskStatus.Cancelled}')");
                tableBuilder.HasCheckConstraint(
                    "CK_transfer_tasks_source_destination_different",
                    "\"SourceLocationId\" <> \"DestinationLocationId\"");
            });

        builder.HasKey(transferTask => transferTask.Id);

        builder.Property(transferTask => transferTask.Quantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(transferTask => transferTask.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(transferTask => transferTask.Reason)
            .HasMaxLength(256);

        builder.Property(transferTask => transferTask.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(transferTask => transferTask.Product)
            .WithMany()
            .HasForeignKey(transferTask => transferTask.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(transferTask => transferTask.SourceLocation)
            .WithMany()
            .HasForeignKey(transferTask => transferTask.SourceLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(transferTask => transferTask.DestinationLocation)
            .WithMany()
            .HasForeignKey(transferTask => transferTask.DestinationLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(transferTask => transferTask.Status);
        builder.HasIndex(transferTask => transferTask.ProductId);
        builder.HasIndex(transferTask => transferTask.SourceLocationId);
        builder.HasIndex(transferTask => transferTask.DestinationLocationId);
        builder.HasIndex(transferTask => transferTask.CreatedAtUtc);
    }
}
