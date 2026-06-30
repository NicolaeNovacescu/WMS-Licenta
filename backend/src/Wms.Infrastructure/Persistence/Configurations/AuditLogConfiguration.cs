using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wms.Domain.Audit;

namespace Wms.Infrastructure.Persistence.Configurations;

public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(auditLog => auditLog.Id);

        builder.Property(auditLog => auditLog.PerformedAtUtc)
            .IsRequired();

        builder.Property(auditLog => auditLog.ActorUserName)
            .HasMaxLength(128);

        builder.Property(auditLog => auditLog.ActorRolesSummary)
            .HasMaxLength(256);

        builder.Property(auditLog => auditLog.ActionType)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(auditLog => auditLog.EntityType)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(auditLog => auditLog.EntityId)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(auditLog => auditLog.Summary)
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(auditLog => auditLog.MetadataJson)
            .HasColumnType("jsonb");

        builder.HasOne(auditLog => auditLog.ActorUser)
            .WithMany()
            .HasForeignKey(auditLog => auditLog.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(auditLog => auditLog.PerformedAtUtc);
        builder.HasIndex(auditLog => new { auditLog.EntityType, auditLog.EntityId });
        builder.HasIndex(auditLog => auditLog.ActionType);
    }
}
