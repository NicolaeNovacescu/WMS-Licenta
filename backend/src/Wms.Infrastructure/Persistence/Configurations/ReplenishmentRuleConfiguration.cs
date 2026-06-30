using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Replenishment;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class ReplenishmentRuleConfiguration : IEntityTypeConfiguration<ReplenishmentRule>
{
    public void Configure(EntityTypeBuilder<ReplenishmentRule> builder)
    {
        builder.ToTable(
            "replenishment_rules",
            tableBuilder =>
            {
                tableBuilder.HasCheckConstraint(
                    "CK_replenishment_rules_minimum_threshold_non_negative",
                    "\"MinimumThreshold\" >= 0");
                tableBuilder.HasCheckConstraint(
                    "CK_replenishment_rules_target_above_threshold",
                    "\"TargetQuantity\" > \"MinimumThreshold\"");
            });

        builder.HasKey(replenishmentRule => replenishmentRule.Id);

        builder.Property(replenishmentRule => replenishmentRule.MinimumThreshold)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(replenishmentRule => replenishmentRule.TargetQuantity)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(replenishmentRule => replenishmentRule.IsActive)
            .IsRequired();

        builder.Property(replenishmentRule => replenishmentRule.CreatedAtUtc)
            .IsRequired();

        builder.Property(replenishmentRule => replenishmentRule.UpdatedAtUtc)
            .IsRequired();

        builder.HasOne(replenishmentRule => replenishmentRule.Product)
            .WithMany()
            .HasForeignKey(replenishmentRule => replenishmentRule.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(replenishmentRule => replenishmentRule.TargetLocation)
            .WithMany()
            .HasForeignKey(replenishmentRule => replenishmentRule.TargetLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(replenishmentRule => replenishmentRule.IsActive);
        builder.HasIndex(replenishmentRule => replenishmentRule.ProductId);
        builder.HasIndex(replenishmentRule => replenishmentRule.TargetLocationId);
        builder.HasIndex(replenishmentRule => replenishmentRule.CreatedAtUtc);
        builder.HasIndex(replenishmentRule => replenishmentRule.UpdatedAtUtc);
    }
}
