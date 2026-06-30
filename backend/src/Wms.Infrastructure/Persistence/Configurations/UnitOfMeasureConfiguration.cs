using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Catalog;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class UnitOfMeasureConfiguration : IEntityTypeConfiguration<UnitOfMeasure>
{
    public void Configure(EntityTypeBuilder<UnitOfMeasure> builder)
    {
        builder.ToTable("units_of_measure");

        builder.HasKey(unitOfMeasure => unitOfMeasure.Id);

        builder.Property(unitOfMeasure => unitOfMeasure.Name)
            .HasMaxLength(50)
            .IsRequired();
    }
}
