using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildingBlocks.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveKidsProgressTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KidsProgress",
                schema: "kids");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "KidsProgress",
                schema: "kids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletedChallengesCount = table.Column<int>(type: "int", nullable: false),
                    CompletedStoriesCount = table.Column<int>(type: "int", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LastActivityAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    QuizzesTakenCount = table.Column<int>(type: "int", nullable: false),
                    TotalPoints = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KidsProgress", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_KidsProgress_DeviceIdentifier",
                schema: "kids",
                table: "KidsProgress",
                column: "DeviceIdentifier",
                unique: true);
        }
    }
}
