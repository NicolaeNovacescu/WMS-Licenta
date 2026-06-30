using Wms.Application.Audit;
using Wms.Application.Audit.Abstractions;
using Wms.Domain.Audit;
using Xunit;

namespace Wms.Application.Tests.Audit;

public sealed class AuditLogServiceTests
{
    [Fact]
    public async Task ListAuditLogsAsync_ReturnsNewestFirstEntries()
    {
        var olderEntry = new AuditLog
        {
            Id = Guid.NewGuid(),
            PerformedAtUtc = DateTimeOffset.UtcNow.AddMinutes(-5),
            ActionType = "ReceiptConfirmed",
            EntityType = "Receipt",
            EntityId = Guid.NewGuid().ToString(),
            Summary = "Confirmed receipt.",
        };

        var newerEntry = new AuditLog
        {
            Id = Guid.NewGuid(),
            PerformedAtUtc = DateTimeOffset.UtcNow,
            ActorUserId = Guid.NewGuid(),
            ActorUserName = "admin.demo",
            ActorRolesSummary = "Admin",
            ActionType = "ShipmentCompleted",
            EntityType = "Shipment",
            EntityId = Guid.NewGuid().ToString(),
            Summary = "Completed shipment.",
            MetadataJson = "{\"salesOrderId\":\"123\"}",
        };

        var service = new AuditLogService(new InMemoryAuditLogRepository([newerEntry, olderEntry]));

        var auditLogs = await service.ListAuditLogsAsync(CancellationToken.None);

        Assert.Equal(2, auditLogs.Count);
        Assert.Equal(newerEntry.Id, auditLogs[0].Id);
        Assert.Equal("admin.demo", auditLogs[0].ActorUserName);
        Assert.Equal("{\"salesOrderId\":\"123\"}", auditLogs[0].MetadataJson);
    }

    [Fact]
    public async Task GetAuditLogByIdAsync_ReturnsNullWhenMissing()
    {
        var service = new AuditLogService(new InMemoryAuditLogRepository([]));

        var auditLog = await service.GetAuditLogByIdAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.Null(auditLog);
    }

    private sealed class InMemoryAuditLogRepository(IReadOnlyList<AuditLog> auditLogs) : IAuditLogRepository
    {
        public Task<IReadOnlyList<AuditLog>> ListAuditLogsAsync(CancellationToken cancellationToken) =>
            Task.FromResult(auditLogs);

        public Task<AuditLog?> FindAuditLogByIdAsync(Guid auditLogId, CancellationToken cancellationToken) =>
            Task.FromResult(auditLogs.SingleOrDefault(auditLog => auditLog.Id == auditLogId));
    }
}
