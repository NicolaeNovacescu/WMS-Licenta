using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Inbound;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("suppliers");

        builder.HasKey(supplier => supplier.Id);

        builder.Property(supplier => supplier.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(supplier => supplier.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(supplier => supplier.IsActive)
            .IsRequired();

        builder.HasIndex(supplier => supplier.Code);
    }
}
