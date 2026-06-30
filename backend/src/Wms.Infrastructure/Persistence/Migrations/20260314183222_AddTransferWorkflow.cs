using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTransferWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "transfer_tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    DestinationLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Reason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transfer_tasks", x => x.Id);
                    table.CheckConstraint("CK_transfer_tasks_quantity_positive", "\"Quantity\" > 0");
                    table.CheckConstraint("CK_transfer_tasks_source_destination_different", "\"SourceLocationId\" <> \"DestinationLocationId\"");
                    table.CheckConstraint("CK_transfer_tasks_status_supported", "\"Status\" IN ('Pending', 'InProgress', 'Completed', 'Cancelled')");
                    table.ForeignKey(
                        name: "FK_transfer_tasks_locations_DestinationLocationId",
                        column: x => x.DestinationLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_transfer_tasks_locations_SourceLocationId",
                        column: x => x.SourceLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_transfer_tasks_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_transfer_tasks_CreatedAtUtc",
                table: "transfer_tasks",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_tasks_DestinationLocationId",
                table: "transfer_tasks",
                column: "DestinationLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_tasks_ProductId",
                table: "transfer_tasks",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_tasks_SourceLocationId",
                table: "transfer_tasks",
                column: "SourceLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_tasks_Status",
                table: "transfer_tasks",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "transfer_tasks");
        }
    }
}
