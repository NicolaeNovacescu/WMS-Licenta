using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Inbound;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ReceiptLineConfiguration : IEntityTypeConfiguration<ReceiptLine>
{
    public void Configure(EntityTypeBuilder<ReceiptLine> builder)
    {
        builder.ToTable(
            "receipt_lines",
            tableBuilder => tableBuilder.HasCheckConstraint(
                "CK_receipt_lines_quantity_positive",
                "\"Quantity\" > 0"));

        builder.HasKey(line => line.Id);

        builder.Property(line => line.Quantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(line => line.InboundOrderLine)
            .WithMany(inboundOrderLine => inboundOrderLine.ReceiptLines)
            .HasForeignKey(line => line.InboundOrderLineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(line => line.ReceivingLocation)
            .WithMany()
            .HasForeignKey(line => line.ReceivingLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(line => line.ReceiptId);
        builder.HasIndex(line => line.InboundOrderLineId);
        builder.HasIndex(line => line.ReceivingLocationId);
    }
}
