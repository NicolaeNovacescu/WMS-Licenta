using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Inventory;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class InventoryMovementConfiguration : IEntityTypeConfiguration<InventoryMovement>
{
    public void Configure(EntityTypeBuilder<InventoryMovement> builder)
    {
        builder.ToTable(
            "inventory_movements",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_movements_quantity_positive",
                    "\"Quantity\" > 0");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_movements_movement_type_supported",
                    $"\"MovementType\" IN ('{InventoryMovementType.Addition}', '{InventoryMovementType.Removal}', '{InventoryMovementType.Relocation}')");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_movements_has_source_or_destination",
                    "\"SourceLocationId\" IS NOT NULL OR \"DestinationLocationId\" IS NOT NULL");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_movements_addition_shape",
                    $"\"MovementType\" <> '{InventoryMovementType.Addition}' OR (\"SourceLocationId\" IS NULL AND \"DestinationLocationId\" IS NOT NULL)");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_movements_removal_shape",
                    $"\"MovementType\" <> '{InventoryMovementType.Removal}' OR (\"SourceLocationId\" IS NOT NULL AND \"DestinationLocationId\" IS NULL)");
                tableBuilder.HasCheckConstraint(
                    "CK_inventory_movements_relocation_shape",
                    $"\"MovementType\" <> '{InventoryMovementType.Relocation}' OR (\"SourceLocationId\" IS NOT NULL AND \"DestinationLocationId\" IS NOT NULL AND \"SourceLocationId\" <> \"DestinationLocationId\")");
            });

        builder.HasKey(movement => movement.Id);

        builder.Property(movement => movement.Quantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(movement => movement.MovementType)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(movement => movement.ReferenceType)
            .HasMaxLength(64);

        builder.Property(movement => movement.ReferenceId)
            .HasMaxLength(128);

        builder.Property(movement => movement.PerformedAtUtc)
            .IsRequired();

        builder.Property(movement => movement.Notes)
            .HasMaxLength(512);

        builder.HasOne(movement => movement.Product)
            .WithMany()
            .HasForeignKey(movement => movement.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(movement => movement.SourceLocation)
            .WithMany()
            .HasForeignKey(movement => movement.SourceLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(movement => movement.DestinationLocation)
            .WithMany()
            .HasForeignKey(movement => movement.DestinationLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(movement => movement.PerformedByUser)
            .WithMany()
            .HasForeignKey(movement => movement.PerformedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(movement => movement.ProductId);
        builder.HasIndex(movement => movement.SourceLocationId);
        builder.HasIndex(movement => movement.DestinationLocationId);
        builder.HasIndex(movement => movement.MovementType);
        builder.HasIndex(movement => movement.PerformedAtUtc);
    }
}
