using Wms.Api.Contracts.Barcodes;
using Wms.Application.Barcode;
using Wms.Application.Barcode.Models;

namespace Wms.Api.Endpoints;

public static class BarcodeEndpoints
{
    private static readonly string[] BarcodeLookupRoles = ["Admin", "Warehouse", "Sales"];

    public static IEndpointRouteBuilder MapBarcodeEndpoints(this IEndpointRouteBuilder app)
    {
        var barcodeGroup = app.MapGroup("/api/barcodes")
            .RequireAuthorization(policy => policy.RequireRole(BarcodeLookupRoles));

        barcodeGroup.MapGet("/{value}", LookupBarcodeAsync);

        return app;
    }

    private static async Task<IResult> LookupBarcodeAsync(
        string value,
        BarcodeLookupService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var lookup = await service.LookupAsync(value, cancellationToken);
            return lookup is null ? Results.NotFound() : Results.Ok(ToResponse(lookup));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static BarcodeLookupResponse ToResponse(BarcodeLookupDto lookup) =>
        new(
            lookup.LookupType,
            lookup.EntityId,
            lookup.Code,
            lookup.DisplayName,
            lookup.Barcode,
            lookup.IsActive);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
