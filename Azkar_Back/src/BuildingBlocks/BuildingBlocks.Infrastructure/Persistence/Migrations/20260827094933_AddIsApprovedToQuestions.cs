using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildingBlocks.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsApprovedToQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrayerSettings",
                schema: "prayer");

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                schema: "questions",
                table: "Questions",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApproved",
                schema: "questions",
                table: "Questions");

            migrationBuilder.EnsureSchema(
                name: "prayer");

            migrationBuilder.CreateTable(
                name: "PrayerSettings",
                schema: "prayer",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CalculationMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CountryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    JuristicMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    TimezoneOffsetMinutes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrayerSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PrayerSettings_DeviceIdentifier",
                schema: "prayer",
                table: "PrayerSettings",
                column: "DeviceIdentifier",
                unique: true);
        }
    }
}
