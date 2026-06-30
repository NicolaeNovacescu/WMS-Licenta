using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.WarehouseStructure;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.ToTable("locations");

        builder.HasKey(location => location.Id);

        builder.Property(location => location.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(location => location.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(location => location.LocationType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(location => location.IsActive)
            .IsRequired();

        builder.Property(location => location.IsBlocked)
            .IsRequired();

        builder.Property(location => location.MapRow)
            .IsRequired();

        builder.Property(location => location.MapColumn)
            .IsRequired();

        builder.HasOne(location => location.Warehouse)
            .WithMany(warehouse => warehouse.Locations)
            .HasForeignKey(location => location.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(location => location.Zone)
            .WithMany(zone => zone.Locations)
            .HasForeignKey(location => location.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(location => new { location.WarehouseId, location.Code })
            .IsUnique();

        builder.HasIndex(location => location.ZoneId);
    }
}
