using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Inbound;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class InboundOrderConfiguration : IEntityTypeConfiguration<InboundOrder>
{
    public void Configure(EntityTypeBuilder<InboundOrder> builder)
    {
        builder.ToTable(
            "inbound_orders",
            tableBuilder => tableBuilder.HasCheckConstraint(
                "CK_inbound_orders_status_supported",
                $"\"Status\" IN ('{InboundOrderStatus.Draft}', '{InboundOrderStatus.ReadyForReceipt}', '{InboundOrderStatus.PartiallyReceived}', '{InboundOrderStatus.FullyReceived}', '{InboundOrderStatus.Cancelled}')"));

        builder.HasKey(inboundOrder => inboundOrder.Id);

        builder.Property(inboundOrder => inboundOrder.SupplierInvoiceReference)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(inboundOrder => inboundOrder.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(inboundOrder => inboundOrder.Notes)
            .HasMaxLength(512);

        builder.Property(inboundOrder => inboundOrder.CreatedAtUtc)
            .IsRequired();

        builder.Property(inboundOrder => inboundOrder.UpdatedAtUtc)
            .IsRequired();

        builder.HasOne(inboundOrder => inboundOrder.Supplier)
            .WithMany(supplier => supplier.InboundOrders)
            .HasForeignKey(inboundOrder => inboundOrder.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(inboundOrder => inboundOrder.Lines)
            .WithOne(line => line.InboundOrder)
            .HasForeignKey(line => line.InboundOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(inboundOrder => inboundOrder.Receipts)
            .WithOne(receipt => receipt.InboundOrder)
            .HasForeignKey(receipt => receipt.InboundOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(inboundOrder => inboundOrder.SupplierId);
        builder.HasIndex(inboundOrder => inboundOrder.Status);
    }
}
