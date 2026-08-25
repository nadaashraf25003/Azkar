using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildingBlocks.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "adhkar");

            migrationBuilder.EnsureSchema(
                name: "questions");

            migrationBuilder.EnsureSchema(
                name: "content");

            migrationBuilder.EnsureSchema(
                name: "administration");

            migrationBuilder.EnsureSchema(
                name: "quran");

            migrationBuilder.EnsureSchema(
                name: "kids");

            migrationBuilder.EnsureSchema(
                name: "favorites");

            migrationBuilder.EnsureSchema(
                name: "prayer");

            migrationBuilder.EnsureSchema(
                name: "notifications");

            migrationBuilder.EnsureSchema(
                name: "recitations");

            migrationBuilder.EnsureSchema(
                name: "tasbeeh");

            migrationBuilder.CreateTable(
                name: "AsmaaAllah",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    NameArabic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEnglish = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transliteration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MeaningArabic = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MeaningEnglish = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuranOccurrences = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AsmaaAllah", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                schema: "administration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimestampUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "adhkar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ArabicName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Challenges",
                schema: "kids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BadgeIcon = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Challenges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContentReports",
                schema: "administration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReporterDeviceIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false),
                    ResolutionNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentReports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DailyProgress",
                schema: "adhkar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ZikrId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletedCount = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyProgress", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                schema: "favorites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ItemType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ItemId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subtitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExtraDataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KidsProgress",
                schema: "kids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TotalPoints = table.Column<int>(type: "int", nullable: false),
                    CompletedStoriesCount = table.Column<int>(type: "int", nullable: false),
                    CompletedChallengesCount = table.Column<int>(type: "int", nullable: false),
                    QuizzesTakenCount = table.Column<int>(type: "int", nullable: false),
                    LastActivityAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KidsProgress", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateFor = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PrayerSettings",
                schema: "prayer",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CalculationMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JuristicMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    CityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CountryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimezoneOffsetMinutes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrayerSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PushSubscriptions",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Endpoint = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    P256dhKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AuthKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MorningAdhkarEnabled = table.Column<bool>(type: "bit", nullable: false),
                    EveningAdhkarEnabled = table.Column<bool>(type: "bit", nullable: false),
                    PrayerRemindersEnabled = table.Column<bool>(type: "bit", nullable: false),
                    DailyQuoteEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PushSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                schema: "questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AskerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Upvotes = table.Column<int>(type: "int", nullable: false),
                    Downvotes = table.Column<int>(type: "int", nullable: false),
                    IsAnswered = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                schema: "kids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionA = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionB = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionC = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionD = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CorrectOptionIndex = table.Column<int>(type: "int", nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Recitations",
                schema: "recitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ReciterName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    SurahNumber = table.Column<int>(type: "int", nullable: false),
                    FromAyah = table.Column<int>(type: "int", nullable: false),
                    ToAyah = table.Column<int>(type: "int", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AverageRating = table.Column<double>(type: "float", nullable: false),
                    RatingsCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recitations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reciters",
                schema: "quran",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NameArabic = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEnglish = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Style = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServerUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reciters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReligiousInfo",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReferenceSource = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReligiousInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SeerahEvents",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Period = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    YearHijri = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LessonsLearned = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeerahEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Stories",
                schema: "kids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    AgeGroup = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MoralLesson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CoverImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Surahs",
                schema: "quran",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    NameArabic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEnglish = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameTranslation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RevelationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VersesCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surahs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TasbeehPresets",
                schema: "tasbeeh",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ArabicText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transliteration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Benefit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetCount = table.Column<int>(type: "int", nullable: false),
                    IsCustom = table.Column<bool>(type: "bit", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TasbeehPresets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TasbeehSessions",
                schema: "tasbeeh",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PresetId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ZikrName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TasbeehSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VoteRecords",
                schema: "questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsUpvote = table.Column<bool>(type: "bit", nullable: false),
                    VotedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoteRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Adhkar",
                schema: "adhkar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ArabicText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Translation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transliteration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RepeatCount = table.Column<int>(type: "int", nullable: false),
                    Fadl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Adhkar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Adhkar_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "adhkar",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Answers",
                schema: "questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReferenceSource = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsVerifiedScholar = table.Column<bool>(type: "bit", nullable: false),
                    Upvotes = table.Column<int>(type: "int", nullable: false),
                    Downvotes = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Answers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Answers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalSchema: "questions",
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecitationComments",
                schema: "recitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecitationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecitationComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecitationComments_Recitations_RecitationId",
                        column: x => x.RecitationId,
                        principalSchema: "recitations",
                        principalTable: "Recitations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecitationRatings",
                schema: "recitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecitationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    RatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecitationRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecitationRatings_Recitations_RecitationId",
                        column: x => x.RecitationId,
                        principalSchema: "recitations",
                        principalTable: "Recitations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ayat",
                schema: "quran",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SurahId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SurahNumber = table.Column<int>(type: "int", nullable: false),
                    NumberInSurah = table.Column<int>(type: "int", nullable: false),
                    NumberInQuran = table.Column<int>(type: "int", nullable: false),
                    Juz = table.Column<int>(type: "int", nullable: false),
                    Page = table.Column<int>(type: "int", nullable: false),
                    ArabicText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Translation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transliteration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    TafsirName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Author = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "IX_Adhkar_CategoryId",
                schema: "adhkar",
                table: "Adhkar",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Answers_QuestionId",
                schema: "questions",
                table: "Answers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_AsmaaAllah_Number",
                schema: "content",
                table: "AsmaaAllah",
                column: "Number",
                unique: true);

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
                name: "IX_DailyProgress_DeviceIdentifier_Date_ZikrId",
                schema: "adhkar",
                table: "DailyProgress",
                columns: new[] { "DeviceIdentifier", "Date", "ZikrId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_DeviceIdentifier_ItemType_ItemId",
                schema: "favorites",
                table: "Favorites",
                columns: new[] { "DeviceIdentifier", "ItemType", "ItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KidsProgress_DeviceIdentifier",
                schema: "kids",
                table: "KidsProgress",
                column: "DeviceIdentifier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrayerSettings_DeviceIdentifier",
                schema: "prayer",
                table: "PrayerSettings",
                column: "DeviceIdentifier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PushSubscriptions_DeviceIdentifier",
                schema: "notifications",
                table: "PushSubscriptions",
                column: "DeviceIdentifier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecitationComments_RecitationId",
                schema: "recitations",
                table: "RecitationComments",
                column: "RecitationId");

            migrationBuilder.CreateIndex(
                name: "IX_RecitationRatings_RecitationId_DeviceIdentifier",
                schema: "recitations",
                table: "RecitationRatings",
                columns: new[] { "RecitationId", "DeviceIdentifier" },
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

            migrationBuilder.CreateIndex(
                name: "IX_VoteRecords_TargetType_TargetId_DeviceIdentifier",
                schema: "questions",
                table: "VoteRecords",
                columns: new[] { "TargetType", "TargetId", "DeviceIdentifier" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Adhkar",
                schema: "adhkar");

            migrationBuilder.DropTable(
                name: "Answers",
                schema: "questions");

            migrationBuilder.DropTable(
                name: "AsmaaAllah",
                schema: "content");

            migrationBuilder.DropTable(
                name: "AuditLogs",
                schema: "administration");

            migrationBuilder.DropTable(
                name: "Challenges",
                schema: "kids");

            migrationBuilder.DropTable(
                name: "ContentReports",
                schema: "administration");

            migrationBuilder.DropTable(
                name: "DailyProgress",
                schema: "adhkar");

            migrationBuilder.DropTable(
                name: "Favorites",
                schema: "favorites");

            migrationBuilder.DropTable(
                name: "KidsProgress",
                schema: "kids");

            migrationBuilder.DropTable(
                name: "Messages",
                schema: "content");

            migrationBuilder.DropTable(
                name: "PrayerSettings",
                schema: "prayer");

            migrationBuilder.DropTable(
                name: "PushSubscriptions",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "QuizQuestions",
                schema: "kids");

            migrationBuilder.DropTable(
                name: "RecitationComments",
                schema: "recitations");

            migrationBuilder.DropTable(
                name: "RecitationRatings",
                schema: "recitations");

            migrationBuilder.DropTable(
                name: "Reciters",
                schema: "quran");

            migrationBuilder.DropTable(
                name: "ReligiousInfo",
                schema: "content");

            migrationBuilder.DropTable(
                name: "SeerahEvents",
                schema: "content");

            migrationBuilder.DropTable(
                name: "Stories",
                schema: "kids");

            migrationBuilder.DropTable(
                name: "Tafsir",
                schema: "quran");

            migrationBuilder.DropTable(
                name: "TasbeehPresets",
                schema: "tasbeeh");

            migrationBuilder.DropTable(
                name: "TasbeehSessions",
                schema: "tasbeeh");

            migrationBuilder.DropTable(
                name: "VoteRecords",
                schema: "questions");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "adhkar");

            migrationBuilder.DropTable(
                name: "Questions",
                schema: "questions");

            migrationBuilder.DropTable(
                name: "Recitations",
                schema: "recitations");

            migrationBuilder.DropTable(
                name: "Ayat",
                schema: "quran");

            migrationBuilder.DropTable(
                name: "Surahs",
                schema: "quran");
        }
    }
}
