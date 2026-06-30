using Wms.Api.Contracts.Suppliers;
using Wms.Application.Suppliers;
using Wms.Application.Suppliers.Models;

namespace Wms.Api.Endpoints;

public static class SupplierManagementEndpoints
{
    public static IEndpointRouteBuilder MapSupplierManagementEndpoints(this IEndpointRouteBuilder app)
    {
        var supplierGroup = app.MapGroup("/api/suppliers")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        supplierGroup.MapGet(string.Empty, GetSuppliersAsync);
        supplierGroup.MapGet("/{id:guid}", GetSupplierByIdAsync);
        supplierGroup.MapPost(string.Empty, CreateSupplierAsync);
        supplierGroup.MapPut("/{id:guid}", UpdateSupplierAsync);
        supplierGroup.MapPatch("/{id:guid}/activate", ActivateSupplierAsync);
        supplierGroup.MapPatch("/{id:guid}/deactivate", DeactivateSupplierAsync);

        return app;
    }

    private static async Task<IResult> GetSuppliersAsync(
        SupplierManagementService service,
        CancellationToken cancellationToken)
    {
        var suppliers = await service.ListSuppliersAsync(cancellationToken);
        return Results.Ok(suppliers.Select(ToResponse));
    }

    private static async Task<IResult> GetSupplierByIdAsync(
        Guid id,
        SupplierManagementService service,
        CancellationToken cancellationToken)
    {
        var supplier = await service.GetSupplierByIdAsync(id, cancellationToken);
        return supplier is null ? Results.NotFound() : Results.Ok(ToDetailResponse(supplier));
    }

    private static async Task<IResult> CreateSupplierAsync(
        CreateSupplierRequest request,
        SupplierManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var supplier = await service.CreateSupplierAsync(
                new CreateSupplierCommand(request.Code, request.Name),
                cancellationToken);

            return Results.Created($"/api/suppliers/{supplier.Id}", ToResponse(supplier));
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

    private static async Task<IResult> UpdateSupplierAsync(
        Guid id,
        UpdateSupplierRequest request,
        SupplierManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var supplier = await service.UpdateSupplierAsync(
                id,
                new UpdateSupplierCommand(request.Code, request.Name),
                cancellationToken);

            return Results.Ok(ToResponse(supplier));
        }
        catch (ArgumentException exception)
        {
            return ValidationProblem(exception);
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static async Task<IResult> ActivateSupplierAsync(
        Guid id,
        SupplierManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var supplier = await service.ActivateSupplierAsync(id, cancellationToken);
            return Results.Ok(ToResponse(supplier));
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static async Task<IResult> DeactivateSupplierAsync(
        Guid id,
        SupplierManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var supplier = await service.DeactivateSupplierAsync(id, cancellationToken);
            return Results.Ok(ToResponse(supplier));
        }
        catch (KeyNotFoundException exception)
        {
            return Results.NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { message = exception.Message });
        }
    }

    private static SupplierResponse ToResponse(SupplierDto supplier) =>
        new(supplier.Id, supplier.Code, supplier.Name, supplier.IsActive);

    private static SupplierDetailResponse ToDetailResponse(SupplierDetailDto supplier) =>
        new(
            supplier.Id,
            supplier.Code,
            supplier.Name,
            supplier.IsActive,
            supplier.ReferencedInboundOrderCount,
            supplier.ActiveReferencedInboundOrderCount);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
