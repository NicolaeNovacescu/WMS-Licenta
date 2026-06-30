using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryMovementFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "inventory_movements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MovementType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    SourceLocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    DestinationLocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReferenceType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    ReferenceId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    PerformedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PerformedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_movements", x => x.Id);
                    table.CheckConstraint("CK_inventory_movements_addition_shape", "\"MovementType\" <> 'ADDITION' OR (\"SourceLocationId\" IS NULL AND \"DestinationLocationId\" IS NOT NULL)");
                    table.CheckConstraint("CK_inventory_movements_has_source_or_destination", "\"SourceLocationId\" IS NOT NULL OR \"DestinationLocationId\" IS NOT NULL");
                    table.CheckConstraint("CK_inventory_movements_movement_type_supported", "\"MovementType\" IN ('ADDITION', 'REMOVAL', 'RELOCATION')");
                    table.CheckConstraint("CK_inventory_movements_quantity_positive", "\"Quantity\" > 0");
                    table.CheckConstraint("CK_inventory_movements_relocation_shape", "\"MovementType\" <> 'RELOCATION' OR (\"SourceLocationId\" IS NOT NULL AND \"DestinationLocationId\" IS NOT NULL AND \"SourceLocationId\" <> \"DestinationLocationId\")");
                    table.CheckConstraint("CK_inventory_movements_removal_shape", "\"MovementType\" <> 'REMOVAL' OR (\"SourceLocationId\" IS NOT NULL AND \"DestinationLocationId\" IS NULL)");
                    table.ForeignKey(
                        name: "FK_inventory_movements_locations_DestinationLocationId",
                        column: x => x.DestinationLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_movements_locations_SourceLocationId",
                        column: x => x.SourceLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_movements_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_movements_users_PerformedByUserId",
                        column: x => x.PerformedByUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_inventory_movements_DestinationLocationId",
                table: "inventory_movements",
                column: "DestinationLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_movements_MovementType",
                table: "inventory_movements",
                column: "MovementType");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_movements_PerformedAtUtc",
                table: "inventory_movements",
                column: "PerformedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_movements_PerformedByUserId",
                table: "inventory_movements",
                column: "PerformedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_movements_ProductId",
                table: "inventory_movements",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_movements_SourceLocationId",
                table: "inventory_movements",
                column: "SourceLocationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "inventory_movements");
        }
    }
}
