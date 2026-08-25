using BuildingBlocks.Domain;

namespace Quran.Domain.Entities;

public class Surah : Entity
{
    public int Number { get; private set; }
    public string NameArabic { get; private set; } = string.Empty;
    public string NameEnglish { get; private set; } = string.Empty;
    public string NameTranslation { get; private set; } = string.Empty;
    public string RevelationType { get; private set; } = "Meccan"; // Meccan or Medinan
    public int VersesCount { get; private set; }

    private readonly List<Ayah> _ayat = [];
    public IReadOnlyCollection<Ayah> Ayat => _ayat.AsReadOnly();

    private Surah() { }

    public static Surah Create(int number, string nameArabic, string nameEnglish, string nameTranslation, string revelationType, int versesCount)
    {
        return new Surah
        {
            Number = number,
            NameArabic = nameArabic,
            NameEnglish = nameEnglish,
            NameTranslation = nameTranslation,
            RevelationType = revelationType,
            VersesCount = versesCount
        };
    }
}

public class Ayah : Entity
{
    public Guid SurahId { get; private set; }
    public int SurahNumber { get; private set; }
    public int NumberInSurah { get; private set; }
    public int NumberInQuran { get; private set; }
    public int Juz { get; private set; }
    public int Page { get; private set; }
    public string ArabicText { get; private set; } = string.Empty;
    public string Translation { get; private set; } = string.Empty;
    public string Transliteration { get; private set; } = string.Empty;
    public string AudioUrl { get; private set; } = string.Empty;

    public Surah? Surah { get; private set; }

    private Ayah() { }

    public static Ayah Create(
        Guid surahId,
        int surahNumber,
        int numberInSurah,
        int numberInQuran,
        int juz,
        int page,
        string arabicText,
        string translation,
        string transliteration,
        string audioUrl = "")
    {
        return new Ayah
        {
            SurahId = surahId,
            SurahNumber = surahNumber,
            NumberInSurah = numberInSurah,
            NumberInQuran = numberInQuran,
            Juz = juz,
            Page = page,
            ArabicText = arabicText,
            Translation = translation,
            Transliteration = transliteration,
            AudioUrl = audioUrl
        };
    }
}

public class Tafsir : Entity
{
    public Guid AyahId { get; private set; }
    public string TafsirName { get; private set; } = "Al-Muyassar";
    public string Author { get; private set; } = "King Fahd Complex";
    public string Text { get; private set; } = string.Empty;

    public Ayah? Ayah { get; private set; }

    private Tafsir() { }

    public static Tafsir Create(Guid ayahId, string tafsirName, string author, string text)
    {
        return new Tafsir
        {
            AyahId = ayahId,
            TafsirName = tafsirName,
            Author = author,
            Text = text
        };
    }
}

public class Reciter : Entity
{
    public string NameArabic { get; private set; } = string.Empty;
    public string NameEnglish { get; private set; } = string.Empty;
    public string Style { get; private set; } = "Murattal"; // Murattal / Mujawwad
    public string ServerUrl { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;

    private Reciter() { }

    public static Reciter Create(string nameArabic, string nameEnglish, string style, string serverUrl, string imageUrl = "")
    {
        return new Reciter
        {
            NameArabic = nameArabic,
            NameEnglish = nameEnglish,
            Style = style,
            ServerUrl = serverUrl,
            ImageUrl = imageUrl
        };
    }
}
