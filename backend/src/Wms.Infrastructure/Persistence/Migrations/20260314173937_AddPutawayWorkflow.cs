using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPutawayWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "putaway_tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    DestinationLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiptLineId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Notes = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_putaway_tasks", x => x.Id);
                    table.CheckConstraint("CK_putaway_tasks_quantity_positive", "\"Quantity\" > 0");
                    table.CheckConstraint("CK_putaway_tasks_source_destination_different", "\"SourceLocationId\" <> \"DestinationLocationId\"");
                    table.CheckConstraint("CK_putaway_tasks_status_supported", "\"Status\" IN ('Pending', 'InProgress', 'Completed', 'Cancelled')");
                    table.ForeignKey(
                        name: "FK_putaway_tasks_locations_DestinationLocationId",
                        column: x => x.DestinationLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_putaway_tasks_locations_SourceLocationId",
                        column: x => x.SourceLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_putaway_tasks_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_putaway_tasks_receipt_lines_ReceiptLineId",
                        column: x => x.ReceiptLineId,
                        principalTable: "receipt_lines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_putaway_tasks_CreatedAtUtc",
                table: "putaway_tasks",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_putaway_tasks_DestinationLocationId",
                table: "putaway_tasks",
                column: "DestinationLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_putaway_tasks_ProductId",
                table: "putaway_tasks",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_putaway_tasks_ReceiptLineId",
                table: "putaway_tasks",
                column: "ReceiptLineId");

            migrationBuilder.CreateIndex(
                name: "IX_putaway_tasks_SourceLocationId",
                table: "putaway_tasks",
                column: "SourceLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_putaway_tasks_Status",
                table: "putaway_tasks",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "putaway_tasks");
        }
    }
}
