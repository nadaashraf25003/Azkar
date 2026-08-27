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
public record GetMessagesQuery(string? Category = null) : IQuery<IReadOnlyList<DailyMessageDto>>;

// Commands
public record CreateReligiousInfoCommand(string Title, string Category, string Content, string ReferenceSource) : ICommand<ReligiousInfoDto>;
public record DeleteReligiousInfoCommand(Guid Id) : ICommand<bool>;
public record CreateSeerahEventCommand(int Order, string Title, string Period, int YearHijri, string Description, string LessonsLearned) : ICommand<SeerahEventDto>;
public record DeleteSeerahEventCommand(Guid Id) : ICommand<bool>;
public record CreateMessageCommand(string Text, string Category, string Source, DateTime? DateFor = null) : ICommand<DailyMessageDto>;
public record DeleteMessageCommand(Guid Id) : ICommand<bool>;




