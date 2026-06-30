using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.WarehouseStructure;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("warehouses");

        builder.HasKey(warehouse => warehouse.Id);

        builder.Property(warehouse => warehouse.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(warehouse => warehouse.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(warehouse => warehouse.IsActive)
            .IsRequired();
    }
}
