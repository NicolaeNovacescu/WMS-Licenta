using Wms.Api.Contracts.Customers;
using Wms.Application.Customers;
using Wms.Application.Customers.Models;

namespace Wms.Api.Endpoints;

public static class CustomerManagementEndpoints
{
    public static IEndpointRouteBuilder MapCustomerManagementEndpoints(this IEndpointRouteBuilder app)
    {
        var customerGroup = app.MapGroup("/api/customers");

        customerGroup.MapGet(string.Empty, GetCustomersAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Sales"));
        customerGroup.MapGet("/{id:guid}", GetCustomerByIdAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        customerGroup.MapPost(string.Empty, CreateCustomerAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        customerGroup.MapPut("/{id:guid}", UpdateCustomerAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        customerGroup.MapPatch("/{id:guid}/activate", ActivateCustomerAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        customerGroup.MapPatch("/{id:guid}/deactivate", DeactivateCustomerAsync)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        return app;
    }

    private static async Task<IResult> GetCustomersAsync(
        CustomerManagementService service,
        CancellationToken cancellationToken)
    {
        var customers = await service.ListCustomersAsync(cancellationToken);
        return Results.Ok(customers.Select(ToResponse));
    }

    private static async Task<IResult> GetCustomerByIdAsync(
        Guid id,
        CustomerManagementService service,
        CancellationToken cancellationToken)
    {
        var customer = await service.GetCustomerByIdAsync(id, cancellationToken);
        return customer is null ? Results.NotFound() : Results.Ok(ToDetailResponse(customer));
    }

    private static async Task<IResult> CreateCustomerAsync(
        CreateCustomerRequest request,
        CustomerManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var customer = await service.CreateCustomerAsync(
                new CreateCustomerCommand(request.Code, request.Name),
                cancellationToken);

            return Results.Created($"/api/customers/{customer.Id}", ToResponse(customer));
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

    private static async Task<IResult> UpdateCustomerAsync(
        Guid id,
        UpdateCustomerRequest request,
        CustomerManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var customer = await service.UpdateCustomerAsync(
                id,
                new UpdateCustomerCommand(request.Code, request.Name),
                cancellationToken);

            return Results.Ok(ToResponse(customer));
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

    private static async Task<IResult> ActivateCustomerAsync(
        Guid id,
        CustomerManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var customer = await service.ActivateCustomerAsync(id, cancellationToken);
            return Results.Ok(ToResponse(customer));
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

    private static async Task<IResult> DeactivateCustomerAsync(
        Guid id,
        CustomerManagementService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var customer = await service.DeactivateCustomerAsync(id, cancellationToken);
            return Results.Ok(ToResponse(customer));
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

    private static CustomerResponse ToResponse(CustomerDto customer) =>
        new(customer.Id, customer.Code, customer.Name, customer.IsActive);

    private static CustomerDetailResponse ToDetailResponse(CustomerDetailDto customer) =>
        new(
            customer.Id,
            customer.Code,
            customer.Name,
            customer.IsActive,
            customer.ReferencedSalesOrderCount,
            customer.ActiveReferencedSalesOrderCount);

    private static IResult ValidationProblem(ArgumentException exception) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [exception.ParamName ?? "request"] = [exception.Message],
        });
}
