using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;
using Wms.Domain.Audit;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Audit;

public sealed class AuditLogWriter(WmsDbContext dbContext, IHttpContextAccessor httpContextAccessor) : IAuditLogWriter
{
    public void Write(AuditLogWriteEntry entry)
    {
        ArgumentNullException.ThrowIfNull(entry);

        var principal = httpContextAccessor.HttpContext?.User;

        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            PerformedAtUtc = DateTimeOffset.UtcNow,
            ActorUserId = TryGetActorUserId(principal),
            ActorUserName = NormalizeOptional(principal?.Identity?.Name),
            ActorRolesSummary = BuildRolesSummary(principal),
            ActionType = NormalizeRequired(entry.ActionType, nameof(entry.ActionType)),
            EntityType = NormalizeRequired(entry.EntityType, nameof(entry.EntityType)),
            EntityId = NormalizeRequired(entry.EntityId, nameof(entry.EntityId)),
            Summary = NormalizeRequired(entry.Summary, nameof(entry.Summary)),
            MetadataJson = SerializeMetadata(entry.Metadata),
        });
    }

    private static Guid? TryGetActorUserId(ClaimsPrincipal? principal)
    {
        if (principal is null)
        {
            return null;
        }

        return Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var actorUserId)
            ? actorUserId
            : null;
    }

    private static string? BuildRolesSummary(ClaimsPrincipal? principal)
    {
        if (principal is null)
        {
            return null;
        }

        var roles = principal.FindAll(ClaimTypes.Role)
            .Select(claim => claim.Value.Trim())
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(value => value, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return roles.Length == 0 ? null : string.Join(", ", roles);
    }

    private static string? SerializeMetadata(object? metadata) =>
        metadata is null ? null : JsonSerializer.Serialize(metadata);

    private static string NormalizeRequired(string? value, string parameterName)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("A value is required.", parameterName);
        }

        return normalized;
    }

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
