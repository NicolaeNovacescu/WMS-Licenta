using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Catalog;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(product => product.Id);

        builder.Property(product => product.Sku)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(product => product.Barcode)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(product => product.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(product => product.Description)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(product => product.ImageUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(product => product.IsActive)
            .IsRequired();

        builder.Property(product => product.DefaultMinPickingThreshold)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(product => product.DefaultTargetPickingQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(product => product.Category)
            .WithMany(category => category.Products)
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(product => product.UnitOfMeasure)
            .WithMany(unitOfMeasure => unitOfMeasure.Products)
            .HasForeignKey(product => product.UnitOfMeasureId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(product => product.Barcode)
            .HasDatabaseName("IX_products_barcode_non_empty_unique")
            .IsUnique()
            .HasFilter("\"Barcode\" <> ''");

        builder.HasIndex(product => product.CategoryId);
        builder.HasIndex(product => product.UnitOfMeasureId);
    }
}