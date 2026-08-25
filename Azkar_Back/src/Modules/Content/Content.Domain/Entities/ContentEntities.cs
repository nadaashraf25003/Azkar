using BuildingBlocks.Domain;

namespace Content.Domain.Entities;

public class AsmaaAllah : Entity
{
    public int Number { get; private set; }
    public string NameArabic { get; private set; } = string.Empty;
    public string NameEnglish { get; private set; } = string.Empty;
    public string Transliteration { get; private set; } = string.Empty;
    public string MeaningArabic { get; private set; } = string.Empty;
    public string MeaningEnglish { get; private set; } = string.Empty;
    public string QuranOccurrences { get; private set; } = string.Empty;
    public string Explanation { get; private set; } = string.Empty;

    private AsmaaAllah() { }

    public static AsmaaAllah Create(int number, string nameArabic, string nameEnglish, string transliteration, string meaningArabic, string meaningEnglish, string quranOccurrences, string explanation)
    {
        return new AsmaaAllah
        {
            Number = number,
            NameArabic = nameArabic,
            NameEnglish = nameEnglish,
            Transliteration = transliteration,
            MeaningArabic = meaningArabic,
            MeaningEnglish = meaningEnglish,
            QuranOccurrences = quranOccurrences,
            Explanation = explanation
        };
    }
}

public class SeerahEvent : Entity
{
    public int Order { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Period { get; private set; } = string.Empty; // Makkah / Madinah
    public int YearHijri { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string LessonsLearned { get; private set; } = string.Empty;

    private SeerahEvent() { }

    public static SeerahEvent Create(int order, string title, string period, int yearHijri, string description, string lessonsLearned)
    {
        return new SeerahEvent
        {
            Order = order,
            Title = title,
            Period = period,
            YearHijri = yearHijri,
            Description = description,
            LessonsLearned = lessonsLearned
        };
    }
}

public class ReligiousInfo : Entity
{
    public string Title { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public string ReferenceSource { get; private set; } = string.Empty;

    private ReligiousInfo() { }

    public static ReligiousInfo Create(string title, string category, string content, string referenceSource)
    {
        return new ReligiousInfo
        {
            Title = title,
            Category = category,
            Content = content,
            ReferenceSource = referenceSource
        };
    }
}

public class DailyMessage : Entity
{
    public string Text { get; private set; } = string.Empty;
    public string Category { get; private set; } = "Inspiration";
    public string Source { get; private set; } = string.Empty;
    public DateTime DateFor { get; private set; } = DateTime.UtcNow.Date;

    private DailyMessage() { }

    public static DailyMessage Create(string text, string category, string source, DateTime? dateFor = null)
    {
        return new DailyMessage
        {
            Text = text,
            Category = category,
            Source = source,
            DateFor = (dateFor ?? DateTime.UtcNow).Date
        };
    }
}
