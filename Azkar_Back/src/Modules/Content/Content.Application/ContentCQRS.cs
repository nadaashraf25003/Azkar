using BuildingBlocks.Application.CQRS;

namespace Content.Application;

public record AsmaaAllahDto(Guid Id, int Number, string NameArabic, string NameEnglish, string Transliteration, string MeaningArabic, string MeaningEnglish, string QuranOccurrences, string Explanation);
public record SeerahEventDto(Guid Id, int Order, string Title, string Period, int YearHijri, string Description, string LessonsLearned);
public record ReligiousInfoDto(Guid Id, string Title, string Category, string Content, string ReferenceSource);
public record DailyMessageDto(Guid Id, string Text, string Category, string Source, DateTime DateFor);

// Queries
public record GetAsmaaAllahQuery : IQuery<IReadOnlyList<AsmaaAllahDto>>;
public record GetAsmaaAllahByNumberQuery(int Number) : IQuery<AsmaaAllahDto>;
public record GetSeerahEventsQuery : IQuery<IReadOnlyList<SeerahEventDto>>;
public record GetReligiousInfoListQuery(string? Category = null) : IQuery<IReadOnlyList<ReligiousInfoDto>>;
public record GetTodayMessageQuery : IQuery<DailyMessageDto>;
