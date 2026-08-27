using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildingBlocks.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveQuranModuleTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reciters",
                schema: "quran");

            migrationBuilder.DropTable(
                name: "Tafsir",
                schema: "quran");

            migrationBuilder.DropTable(
                name: "Ayat",
                schema: "quran");

            migrationBuilder.DropTable(
                name: "Surahs",
                schema: "quran");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "quran");

            migrationBuilder.CreateTable(
                name: "Reciters",
                schema: "quran",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NameArabic = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEnglish = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ServerUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Style = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reciters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Surahs",
                schema: "quran",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NameArabic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEnglish = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameTranslation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    RevelationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VersesCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surahs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ayat",
                schema: "quran",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SurahId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ArabicText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Juz = table.Column<int>(type: "int", nullable: false),
                    NumberInQuran = table.Column<int>(type: "int", nullable: false),
                    NumberInSurah = table.Column<int>(type: "int", nullable: false),
                    Page = table.Column<int>(type: "int", nullable: false),
                    SurahNumber = table.Column<int>(type: "int", nullable: false),
                    Translation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transliteration = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ayat", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ayat_Surahs_SurahId",
                        column: x => x.SurahId,
                        principalSchema: "quran",
                        principalTable: "Surahs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tafsir",
                schema: "quran",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AyahId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Author = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TafsirName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tafsir", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tafsir_Ayat_AyahId",
                        column: x => x.AyahId,
                        principalSchema: "quran",
                        principalTable: "Ayat",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ayat_SurahId",
                schema: "quran",
                table: "Ayat",
                column: "SurahId");

            migrationBuilder.CreateIndex(
                name: "IX_Ayat_SurahNumber_NumberInSurah",
                schema: "quran",
                table: "Ayat",
                columns: new[] { "SurahNumber", "NumberInSurah" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Surahs_Number",
                schema: "quran",
                table: "Surahs",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tafsir_AyahId",
                schema: "quran",
                table: "Tafsir",
                column: "AyahId");
        }
    }
}
