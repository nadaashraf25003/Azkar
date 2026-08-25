using BuildingBlocks.Domain;

namespace Adhkar.Domain.Entities;

public class ZikrCategory : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string ArabicName { get; private set; } = string.Empty;
    public string Icon { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int Order { get; private set; }

    private readonly List<Zikr> _adhkar = [];
    public IReadOnlyCollection<Zikr> Adhkar => _adhkar.AsReadOnly();

    private ZikrCategory() { }

    public static ZikrCategory Create(string name, string arabicName, string icon, string description, int order = 0)
    {
        return new ZikrCategory
        {
            Name = name,
            ArabicName = arabicName,
            Icon = icon,
            Description = description,
            Order = order
        };
    }
}

public class Zikr : AuditableEntity
{
    public Guid CategoryId { get; private set; }
    public string ArabicText { get; private set; } = string.Empty;
    public string Translation { get; private set; } = string.Empty;
    public string Transliteration { get; private set; } = string.Empty;
    public int RepeatCount { get; private set; } = 1;
    public string Fadl { get; private set; } = string.Empty;
    public string Source { get; private set; } = string.Empty;
    public string AudioUrl { get; private set; } = string.Empty;
    public int Order { get; private set; }

    public ZikrCategory? Category { get; private set; }

    private Zikr() { }

    public static Zikr Create(
        Guid categoryId,
        string arabicText,
        string translation,
        string transliteration,
        int repeatCount,
        string fadl,
        string source,
        string audioUrl = "",
        int order = 0)
    {
        return new Zikr
        {
            CategoryId = categoryId,
            ArabicText = arabicText,
            Translation = translation,
            Transliteration = transliteration,
            RepeatCount = repeatCount,
            Fadl = fadl,
            Source = source,
            AudioUrl = audioUrl,
            Order = order
        };
    }
}

public class DailyProgress : AuditableEntity
{
    public string DeviceIdentifier { get; private set; } = string.Empty;
    public DateTime Date { get; private set; }
    public Guid ZikrId { get; private set; }
    public int CompletedCount { get; private set; }
    public bool IsCompleted { get; private set; }

    private DailyProgress() { }

    public static DailyProgress Create(string deviceIdentifier, Guid zikrId, int completedCount, bool isCompleted)
    {
        return new DailyProgress
        {
            DeviceIdentifier = deviceIdentifier,
            Date = DateTime.UtcNow.Date,
            ZikrId = zikrId,
            CompletedCount = completedCount,
            IsCompleted = isCompleted
        };
    }

    public void UpdateProgress(int count, bool isCompleted)
    {
        CompletedCount = count;
        IsCompleted = isCompleted;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
