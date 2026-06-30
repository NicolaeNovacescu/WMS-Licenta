using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddReplenishmentFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "replenishment_rules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    MinimumThreshold = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TargetQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_replenishment_rules", x => x.Id);
                    table.CheckConstraint("CK_replenishment_rules_minimum_threshold_non_negative", "\"MinimumThreshold\" >= 0");
                    table.CheckConstraint("CK_replenishment_rules_target_above_threshold", "\"TargetQuantity\" > \"MinimumThreshold\"");
                    table.ForeignKey(
                        name: "FK_replenishment_rules_locations_TargetLocationId",
                        column: x => x.TargetLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_replenishment_rules_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "replenishment_tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReplenishmentRuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_replenishment_tasks", x => x.Id);
                    table.CheckConstraint("CK_replenishment_tasks_quantity_positive", "\"Quantity\" > 0");
                    table.CheckConstraint("CK_replenishment_tasks_source_target_different", "\"SourceLocationId\" <> \"TargetLocationId\"");
                    table.CheckConstraint("CK_replenishment_tasks_status_supported", "\"Status\" IN ('Pending', 'InProgress', 'Completed', 'Cancelled')");
                    table.ForeignKey(
                        name: "FK_replenishment_tasks_locations_SourceLocationId",
                        column: x => x.SourceLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_replenishment_tasks_locations_TargetLocationId",
                        column: x => x.TargetLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_replenishment_tasks_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_replenishment_tasks_replenishment_rules_ReplenishmentRuleId",
                        column: x => x.ReplenishmentRuleId,
                        principalTable: "replenishment_rules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_rules_CreatedAtUtc",
                table: "replenishment_rules",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_rules_IsActive",
                table: "replenishment_rules",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_rules_ProductId",
                table: "replenishment_rules",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_rules_TargetLocationId",
                table: "replenishment_rules",
                column: "TargetLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_rules_UpdatedAtUtc",
                table: "replenishment_rules",
                column: "UpdatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_tasks_CreatedAtUtc",
                table: "replenishment_tasks",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_tasks_ProductId",
                table: "replenishment_tasks",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_tasks_ReplenishmentRuleId",
                table: "replenishment_tasks",
                column: "ReplenishmentRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_tasks_SourceLocationId",
                table: "replenishment_tasks",
                column: "SourceLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_tasks_Status",
                table: "replenishment_tasks",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_replenishment_tasks_TargetLocationId",
                table: "replenishment_tasks",
                column: "TargetLocationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "replenishment_tasks");

            migrationBuilder.DropTable(
                name: "replenishment_rules");
        }
    }
}
