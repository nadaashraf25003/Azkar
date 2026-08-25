using Microsoft.EntityFrameworkCore;
using Adhkar.Domain.Entities;
using Adhkar.Application.Common;
using Quran.Domain.Entities;
using Quran.Application.Common;
using Recitations.Domain.Entities;
using Recitations.Application.Common;
using Tasbeeh.Domain.Entities;
using Tasbeeh.Application.Common;
using Questions.Domain.Entities;
using Questions.Application.Common;
using Content.Domain.Entities;
using Content.Application.Common;
using Kids.Domain.Entities;
using Kids.Application.Common;
using Prayer.Domain.Entities;
using Prayer.Application.Common;
using Favorites.Domain.Entities;
using Favorites.Application.Common;
using Notifications.Domain.Entities;
using Notifications.Application.Common;
using Administration.Domain.Entities;
using Administration.Application.Common;

namespace BuildingBlocks.Infrastructure.Persistence;

public class AzkarDbContext : DbContext,
    IAdhkarDbContext,
    IQuranDbContext,
    IRecitationsDbContext,
    ITasbeehDbContext,
    IQuestionsDbContext,
    IContentDbContext,
    IKidsDbContext,
    IPrayerDbContext,
    IFavoritesDbContext,
    INotificationsDbContext,
    IAdministrationDbContext
{
    public AzkarDbContext(DbContextOptions<AzkarDbContext> options) : base(options)
    {
    }

    // Adhkar
    public DbSet<ZikrCategory> ZikrCategories => Set<ZikrCategory>();
    public DbSet<Zikr> Adhkar => Set<Zikr>();
    public DbSet<DailyProgress> DailyProgresses => Set<DailyProgress>();

    // Quran
    public DbSet<Surah> Surahs => Set<Surah>();
    public DbSet<Ayah> Ayat => Set<Ayah>();
    public DbSet<Tafsir> Tafsirs => Set<Tafsir>();
    public DbSet<Reciter> Reciters => Set<Reciter>();

    // Recitations
    public DbSet<Recitation> Recitations => Set<Recitation>();
    public DbSet<RecitationComment> RecitationComments => Set<RecitationComment>();
    public DbSet<RecitationRating> RecitationRatings => Set<RecitationRating>();

    // Tasbeeh
    public DbSet<TasbeehPreset> TasbeehPresets => Set<TasbeehPreset>();
    public DbSet<TasbeehSession> TasbeehSessions => Set<TasbeehSession>();

    // Questions
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<VoteRecord> VoteRecords => Set<VoteRecord>();

    // Content
    public DbSet<AsmaaAllah> AsmaaAllah => Set<AsmaaAllah>();
    public DbSet<SeerahEvent> SeerahEvents => Set<SeerahEvent>();
    public DbSet<ReligiousInfo> ReligiousInfos => Set<ReligiousInfo>();
    public DbSet<DailyMessage> DailyMessages => Set<DailyMessage>();

    // Kids
    public DbSet<KidsStory> KidsStories => Set<KidsStory>();
    public DbSet<KidsChallenge> KidsChallenges => Set<KidsChallenge>();
    public DbSet<KidsQuizQuestion> KidsQuizQuestions => Set<KidsQuizQuestion>();
    public DbSet<KidsProgress> KidsProgresses => Set<KidsProgress>();

    // Prayer
    public DbSet<PrayerTimeSetting> PrayerSettings => Set<PrayerTimeSetting>();

    // Favorites
    public DbSet<Favorite> Favorites => Set<Favorite>();

    // Notifications
    public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();

    // Administration
    public DbSet<ContentReport> ContentReports => Set<ContentReport>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Adhkar Schema
        modelBuilder.Entity<ZikrCategory>(b =>
        {
            b.ToTable("Categories", "adhkar");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(150).IsRequired();
            b.Property(x => x.ArabicName).HasMaxLength(150).IsRequired();
            b.HasMany(x => x.Adhkar).WithOne(x => x.Category).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Zikr>(b =>
        {
            b.ToTable("Adhkar", "adhkar");
            b.HasKey(x => x.Id);
            b.Property(x => x.ArabicText).IsRequired();
        });

        modelBuilder.Entity<DailyProgress>(b =>
        {
            b.ToTable("DailyProgress", "adhkar");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.DeviceIdentifier, x.Date, x.ZikrId }).IsUnique();
        });

        // Quran Schema
        modelBuilder.Entity<Surah>(b =>
        {
            b.ToTable("Surahs", "quran");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Number).IsUnique();
            b.Property(x => x.NameArabic).HasMaxLength(100).IsRequired();
            b.Property(x => x.NameEnglish).HasMaxLength(100).IsRequired();
            b.HasMany(x => x.Ayat).WithOne(x => x.Surah).HasForeignKey(x => x.SurahId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Ayah>(b =>
        {
            b.ToTable("Ayat", "quran");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.SurahNumber, x.NumberInSurah }).IsUnique();
            b.Property(x => x.ArabicText).IsRequired();
        });

        modelBuilder.Entity<Tafsir>(b =>
        {
            b.ToTable("Tafsir", "quran");
            b.HasKey(x => x.Id);
            b.Property(x => x.Text).IsRequired();
        });

        modelBuilder.Entity<Reciter>(b =>
        {
            b.ToTable("Reciters", "quran");
            b.HasKey(x => x.Id);
            b.Property(x => x.NameArabic).HasMaxLength(150).IsRequired();
            b.Property(x => x.NameEnglish).HasMaxLength(150).IsRequired();
        });

        // Recitations Schema
        modelBuilder.Entity<Recitation>(b =>
        {
            b.ToTable("Recitations", "recitations");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(200).IsRequired();
            b.Property(x => x.ReciterName).HasMaxLength(150).IsRequired();
            b.Property(x => x.AudioUrl).HasMaxLength(1000).IsRequired();
            b.HasMany(x => x.Comments).WithOne(x => x.Recitation).HasForeignKey(x => x.RecitationId).OnDelete(DeleteBehavior.Cascade);
            b.HasMany(x => x.Ratings).WithOne().HasForeignKey(x => x.RecitationId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RecitationComment>(b =>
        {
            b.ToTable("RecitationComments", "recitations");
            b.HasKey(x => x.Id);
            b.Property(x => x.Content).HasMaxLength(1000).IsRequired();
        });

        modelBuilder.Entity<RecitationRating>(b =>
        {
            b.ToTable("RecitationRatings", "recitations");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.RecitationId, x.DeviceIdentifier }).IsUnique();
        });

        // Tasbeeh Schema
        modelBuilder.Entity<TasbeehPreset>(b =>
        {
            b.ToTable("TasbeehPresets", "tasbeeh");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(150).IsRequired();
            b.Property(x => x.ArabicText).IsRequired();
        });

        modelBuilder.Entity<TasbeehSession>(b =>
        {
            b.ToTable("TasbeehSessions", "tasbeeh");
            b.HasKey(x => x.Id);
            b.Property(x => x.DeviceIdentifier).HasMaxLength(100).IsRequired();
        });

        // Questions Schema
        modelBuilder.Entity<Question>(b =>
        {
            b.ToTable("Questions", "questions");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(300).IsRequired();
            b.Property(x => x.Content).IsRequired();
            b.HasMany(x => x.Answers).WithOne(x => x.Question).HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Answer>(b =>
        {
            b.ToTable("Answers", "questions");
            b.HasKey(x => x.Id);
            b.Property(x => x.Content).IsRequired();
        });

        modelBuilder.Entity<VoteRecord>(b =>
        {
            b.ToTable("VoteRecords", "questions");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.TargetType, x.TargetId, x.DeviceIdentifier }).IsUnique();
        });

        // Content Schema
        modelBuilder.Entity<AsmaaAllah>(b =>
        {
            b.ToTable("AsmaaAllah", "content");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Number).IsUnique();
            b.Property(x => x.NameArabic).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<SeerahEvent>(b =>
        {
            b.ToTable("SeerahEvents", "content");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(250).IsRequired();
        });

        modelBuilder.Entity<ReligiousInfo>(b =>
        {
            b.ToTable("ReligiousInfo", "content");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(250).IsRequired();
        });

        modelBuilder.Entity<DailyMessage>(b =>
        {
            b.ToTable("Messages", "content");
            b.HasKey(x => x.Id);
            b.Property(x => x.Text).IsRequired();
        });

        // Kids Schema
        modelBuilder.Entity<KidsStory>(b =>
        {
            b.ToTable("Stories", "kids");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(250).IsRequired();
        });

        modelBuilder.Entity<KidsChallenge>(b =>
        {
            b.ToTable("Challenges", "kids");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<KidsQuizQuestion>(b =>
        {
            b.ToTable("QuizQuestions", "kids");
            b.HasKey(x => x.Id);
            b.Property(x => x.QuestionText).IsRequired();
        });

        modelBuilder.Entity<KidsProgress>(b =>
        {
            b.ToTable("KidsProgress", "kids");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.DeviceIdentifier).IsUnique();
        });

        // Prayer Schema
        modelBuilder.Entity<PrayerTimeSetting>(b =>
        {
            b.ToTable("PrayerSettings", "prayer");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.DeviceIdentifier).IsUnique();
        });

        // Favorites Schema
        modelBuilder.Entity<Favorite>(b =>
        {
            b.ToTable("Favorites", "favorites");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.DeviceIdentifier, x.ItemType, x.ItemId }).IsUnique();
        });

        // Notifications Schema
        modelBuilder.Entity<PushSubscription>(b =>
        {
            b.ToTable("PushSubscriptions", "notifications");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.DeviceIdentifier).IsUnique();
        });

        // Administration Schema
        modelBuilder.Entity<ContentReport>(b =>
        {
            b.ToTable("ContentReports", "administration");
            b.HasKey(x => x.Id);
        });

        modelBuilder.Entity<AuditLog>(b =>
        {
            b.ToTable("AuditLogs", "administration");
            b.HasKey(x => x.Id);
        });
    }
}
