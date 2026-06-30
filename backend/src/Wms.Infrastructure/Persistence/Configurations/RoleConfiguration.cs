using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Authentication;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

        builder.HasKey(role => role.Id);

        builder.Property(role => role.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(role => role.Name)
            .IsUnique();
    }
}
