using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Inbound;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
{
    public void Configure(EntityTypeBuilder<Receipt> builder)
    {
        builder.ToTable(
            "receipts",
            tableBuilder => tableBuilder.HasCheckConstraint(
                "CK_receipts_status_supported",
                $"\"Status\" IN ('{ReceiptStatus.Draft}', '{ReceiptStatus.InProgress}', '{ReceiptStatus.Confirmed}', '{ReceiptStatus.Cancelled}')"));

        builder.HasKey(receipt => receipt.Id);

        builder.Property(receipt => receipt.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(receipt => receipt.Notes)
            .HasMaxLength(512);

        builder.Property(receipt => receipt.CreatedAtUtc)
            .IsRequired();

        builder.HasMany(receipt => receipt.Lines)
            .WithOne(line => line.Receipt)
            .HasForeignKey(line => line.ReceiptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(receipt => receipt.InboundOrderId);
        builder.HasIndex(receipt => receipt.Status);
        builder.HasIndex(receipt => receipt.CreatedAtUtc);
    }
}
