using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Sales;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");

        builder.HasKey(customer => customer.Id);

        builder.Property(customer => customer.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(customer => customer.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(customer => customer.IsActive)
            .IsRequired();

        builder.HasIndex(customer => customer.Code)
            .IsUnique();
    }
}
