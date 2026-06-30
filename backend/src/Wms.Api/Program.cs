using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Wms.Api.Endpoints;
using Wms.Application.Audit;
using Wms.Application.Audit.Abstractions;
using Wms.Application.Barcode;
using Wms.Application.Barcode.Abstractions;
using Wms.Application.Catalog;
using Wms.Application.Catalog.Abstractions;
using Wms.Application.Customers;
using Wms.Application.Customers.Abstractions;
using Wms.Application.Authentication;
using Wms.Application.Authentication.Abstractions;
using Wms.Application.Inventory;
using Wms.Application.Inventory.Abstractions;
using Wms.Application.InventoryCount;
using Wms.Application.InventoryCount.Abstractions;
using Wms.Application.Inbound;
using Wms.Application.Inbound.Abstractions;
using Wms.Application.Picking;
using Wms.Application.Picking.Abstractions;
using Wms.Application.Putaway;
using Wms.Application.Putaway.Abstractions;
using Wms.Application.Replenishment;
using Wms.Application.Replenishment.Abstractions;
using Wms.Application.Sales;
using Wms.Application.Sales.Abstractions;
using Wms.Application.Shipment;
using Wms.Application.Shipment.Abstractions;
using Wms.Application.Suppliers;
using Wms.Application.Suppliers.Abstractions;
using Wms.Application.Transfer;
using Wms.Application.Transfer.Abstractions;
using Wms.Application.WarehouseStructure;
using Wms.Application.WarehouseStructure.Abstractions;
using Wms.Infrastructure.Authentication;
using Wms.Infrastructure.Audit;
using Wms.Infrastructure.Barcode;
using Wms.Infrastructure.Catalog;
using Wms.Infrastructure.Customers;
using Wms.Infrastructure.Inbound;
using Wms.Infrastructure.Inventory;
using Wms.Infrastructure.InventoryCount;
using Wms.Infrastructure.Persistence;
using Wms.Infrastructure.Persistence.Development;
using Wms.Infrastructure.Picking;
using Wms.Infrastructure.Putaway;
using Wms.Infrastructure.Replenishment;
using Wms.Infrastructure.Sales;
using Wms.Infrastructure.Shipment;
using Wms.Infrastructure.Suppliers;
using Wms.Infrastructure.Transfer;
using Wms.Infrastructure.WarehouseStructure;

var builder = WebApplication.CreateBuilder(args);

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();

builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddOptions<DevelopmentSeedOptions>()
    .Bind(builder.Configuration.GetSection(DevelopmentSeedOptions.SectionName))
    .ValidateOnStart();

builder.Services.AddDbContext<WmsDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Postgres") ?? string.Empty,
        npgsql => npgsql.MigrationsAssembly(typeof(WmsDbContext).Assembly.FullName)));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserAuthRepository, UserAuthRepository>();
builder.Services.AddScoped<UserManagementService>();
builder.Services.AddScoped<IUserManagementRepository, UserManagementRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasherAdapter>();
builder.Services.AddScoped<ITokenFactory, JwtTokenFactory>();
builder.Services.AddScoped<AuditLogService>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogWriter, AuditLogWriter>();
builder.Services.AddScoped<BarcodeLookupService>();
builder.Services.AddScoped<IBarcodeLookupRepository, BarcodeLookupRepository>();
builder.Services.AddScoped<CustomerManagementService>();
builder.Services.AddScoped<ICustomerManagementRepository, CustomerManagementRepository>();
builder.Services.AddScoped<ProductCatalogService>();
builder.Services.AddScoped<IProductCatalogRepository, ProductCatalogRepository>();
builder.Services.AddScoped<InventoryMovementHistoryService>();
builder.Services.AddScoped<IInventoryMovementHistoryRepository, InventoryMovementHistoryRepository>();
builder.Services.AddScoped<InventoryVisibilityService>();
builder.Services.AddScoped<IInventoryVisibilityRepository, InventoryVisibilityRepository>();
builder.Services.AddScoped<InventoryCountWorkflowService>();
builder.Services.AddScoped<IInventoryCountWorkflowRepository, InventoryCountWorkflowRepository>();
builder.Services.AddScoped<InboundWorkflowService>();
builder.Services.AddScoped<IInboundWorkflowRepository, InboundWorkflowRepository>();
builder.Services.AddScoped<PickingWorkflowService>();
builder.Services.AddScoped<IPickingWorkflowRepository, PickingWorkflowRepository>();
builder.Services.AddScoped<PutawayWorkflowService>();
builder.Services.AddScoped<IPutawayWorkflowRepository, PutawayWorkflowRepository>();
builder.Services.AddScoped<ReplenishmentWorkflowService>();
builder.Services.AddScoped<IReplenishmentWorkflowRepository, ReplenishmentWorkflowRepository>();
builder.Services.AddScoped<SalesOrderWorkflowService>();
builder.Services.AddScoped<ISalesOrderWorkflowRepository, SalesOrderWorkflowRepository>();
builder.Services.AddScoped<ShipmentWorkflowService>();
builder.Services.AddScoped<IShipmentWorkflowRepository, ShipmentWorkflowRepository>();
builder.Services.AddScoped<SupplierManagementService>();
builder.Services.AddScoped<ISupplierManagementRepository, SupplierManagementRepository>();
builder.Services.AddScoped<TransferWorkflowService>();
builder.Services.AddScoped<ITransferWorkflowRepository, TransferWorkflowRepository>();
builder.Services.AddScoped<WarehouseStructureService>();
builder.Services.AddScoped<IWarehouseStructureRepository, WarehouseStructureRepository>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    await app.Services.InitializeDevelopmentDatabaseAsync();
}

app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    service = "Wms.Api",
    status = "ready",
    environment = app.Environment.EnvironmentName
}));

app.MapHealthEndpoints();
app.MapAuthEndpoints();
app.MapAuditLogEndpoints();
app.MapBarcodeEndpoints();
app.MapCustomerManagementEndpoints();
app.MapInboundEndpoints();
app.MapInventoryCountEndpoints();
app.MapPickingEndpoints();
app.MapPutawayEndpoints();
app.MapReplenishmentEndpoints();
app.MapSalesOrderEndpoints();
app.MapShipmentEndpoints();
app.MapSupplierManagementEndpoints();
app.MapTransferEndpoints();
app.MapUserManagementEndpoints();
app.MapProductCatalogEndpoints();
app.MapInventoryEndpoints();
app.MapWarehouseStructureEndpoints();

app.Run();

public partial class Program;
