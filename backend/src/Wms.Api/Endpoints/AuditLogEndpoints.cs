using Wms.Api.Contracts.AuditLogs;
using Wms.Application.Audit;
using Wms.Application.Audit.Models;

namespace Wms.Api.Endpoints;

public static class AuditLogEndpoints
{
    public static IEndpointRouteBuilder MapAuditLogEndpoints(this IEndpointRouteBuilder app)
    {
        var auditLogGroup = app.MapGroup("/api/audit-logs")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        auditLogGroup.MapGet(string.Empty, GetAuditLogsAsync);
        auditLogGroup.MapGet("/{id:guid}", GetAuditLogByIdAsync);

        return app;
    }

    private static async Task<IResult> GetAuditLogsAsync(
        AuditLogService service,
        CancellationToken cancellationToken)
    {
        var auditLogs = await service.ListAuditLogsAsync(cancellationToken);
        return Results.Ok(auditLogs.Select(ToResponse));
    }

    private static async Task<IResult> GetAuditLogByIdAsync(
        Guid id,
        AuditLogService service,
        CancellationToken cancellationToken)
    {
        var auditLog = await service.GetAuditLogByIdAsync(id, cancellationToken);
        return auditLog is null ? Results.NotFound() : Results.Ok(ToResponse(auditLog));
    }

    private static AuditLogResponse ToResponse(AuditLogDto auditLog) =>
        new(
            auditLog.Id,
            auditLog.PerformedAtUtc,
            auditLog.ActorUserId,
            auditLog.ActorUserName,
            auditLog.ActorRolesSummary,
            auditLog.ActionType,
            auditLog.EntityType,
            auditLog.EntityId,
            auditLog.Summary,
            auditLog.MetadataJson);
}
