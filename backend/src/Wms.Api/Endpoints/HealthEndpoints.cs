namespace Wms.Api.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/health", () => Results.Ok(new
        {
            service = "Wms.Api",
            status = "ok",
            timestampUtc = DateTimeOffset.UtcNow
        }))
        .WithName("GetHealth");

        return app;
    }
}
