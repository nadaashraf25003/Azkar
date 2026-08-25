using BuildingBlocks.Application.CQRS;

namespace Quran.Application;

public record SurahDto(Guid Id, int Number, string NameArabic, string NameEnglish, string NameTranslation, string RevelationType, int VersesCount);
public record AyahDto(Guid Id, Guid SurahId, int SurahNumber, int NumberInSurah, int NumberInQuran, int Juz, int Page, string ArabicText, string Translation, string Transliteration, string AudioUrl);
public record TafsirDto(Guid Id, Guid AyahId, string TafsirName, string Author, string Text);
public record ReciterDto(Guid Id, string NameArabic, string NameEnglish, string Style, string ServerUrl, string ImageUrl);

// Queries
public record GetSurahsQuery : IQuery<IReadOnlyList<SurahDto>>;
public record GetSurahByNumberQuery(int Number) : IQuery<SurahDto>;
public record GetAyatBySurahQuery(int SurahNumber) : IQuery<IReadOnlyList<AyahDto>>;
public record GetAyahDetailsQuery(int SurahNumber, int AyahNumber) : IQuery<AyahDto>;
public record GetAyatByJuzQuery(int Juz) : IQuery<IReadOnlyList<AyahDto>>;
public record GetTafsirByAyahQuery(int SurahNumber, int AyahNumber, string? TafsirName = null) : IQuery<TafsirDto>;
public record GetRecitersQuery : IQuery<IReadOnlyList<ReciterDto>>;
