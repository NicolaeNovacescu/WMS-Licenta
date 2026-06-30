using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.WarehouseStructure;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ZoneConfiguration : IEntityTypeConfiguration<Zone>
{
    public void Configure(EntityTypeBuilder<Zone> builder)
    {
        builder.ToTable("zones");

        builder.HasKey(zone => zone.Id);

        builder.Property(zone => zone.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(zone => zone.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(zone => zone.IsActive)
            .IsRequired();

        builder.HasOne(zone => zone.Warehouse)
            .WithMany(warehouse => warehouse.Zones)
            .HasForeignKey(zone => zone.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(zone => zone.WarehouseId);
    }
}
