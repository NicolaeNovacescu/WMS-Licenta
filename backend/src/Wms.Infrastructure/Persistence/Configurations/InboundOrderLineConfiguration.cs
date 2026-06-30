using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Inbound;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class InboundOrderLineConfiguration : IEntityTypeConfiguration<InboundOrderLine>
{
    public void Configure(EntityTypeBuilder<InboundOrderLine> builder)
    {
        builder.ToTable(
            "inbound_order_lines",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_inbound_order_lines_expected_non_negative",
                    "\"ExpectedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_inbound_order_lines_received_non_negative",
                    "\"ReceivedQuantity\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_inbound_order_lines_received_not_greater_than_expected",
                    "\"ReceivedQuantity\" <= \"ExpectedQuantity\"");
            });

        builder.HasKey(line => line.Id);

        builder.Property(line => line.ExpectedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(line => line.ReceivedQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(line => line.Product)
            .WithMany()
            .HasForeignKey(line => line.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(line => line.InboundOrderId);
        builder.HasIndex(line => line.ProductId);
    }
}
