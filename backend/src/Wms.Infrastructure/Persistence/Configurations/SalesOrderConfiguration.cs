using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Sales;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable(
            "sales_orders",
            tableBuilder => tableBuilder.HasCheckConstraint(
                "CK_sales_orders_status_supported",
                $"\"Status\" IN ('{SalesOrderStatus.Draft}', '{SalesOrderStatus.Confirmed}', '{SalesOrderStatus.PartiallyReserved}', '{SalesOrderStatus.FullyReserved}', '{SalesOrderStatus.Cancelled}')"));

        builder.HasKey(salesOrder => salesOrder.Id);

        builder.Property(salesOrder => salesOrder.Status)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(salesOrder => salesOrder.CreatedAtUtc)
            .IsRequired();

        builder.Property(salesOrder => salesOrder.UpdatedAtUtc)
            .IsRequired();

        builder.HasOne(salesOrder => salesOrder.Customer)
            .WithMany(customer => customer.SalesOrders)
            .HasForeignKey(salesOrder => salesOrder.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(salesOrder => salesOrder.Lines)
            .WithOne(line => line.SalesOrder)
            .HasForeignKey(line => line.SalesOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(salesOrder => salesOrder.CustomerId);
        builder.HasIndex(salesOrder => salesOrder.Status);
        builder.HasIndex(salesOrder => salesOrder.CreatedAtUtc);
    }
}
