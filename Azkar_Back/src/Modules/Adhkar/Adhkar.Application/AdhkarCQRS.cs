using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using FluentValidation;

namespace Adhkar.Application;

public record CategoryDto(Guid Id, string Name, string ArabicName, string Icon, string Description, int Order, int ZikrCount);
public record ZikrDto(Guid Id, Guid CategoryId, string ArabicText, string Translation, string Transliteration, int RepeatCount, string Fadl, string Source, string AudioUrl, int Order);

// Queries
public record GetCategoriesQuery : IQuery<IReadOnlyList<CategoryDto>>;
public record GetAllAdhkarQuery : IQuery<IReadOnlyList<ZikrDto>>;
public record GetAdhkarByCategoryQuery(Guid CategoryId) : IQuery<IReadOnlyList<ZikrDto>>;
public record GetZikrByIdQuery(Guid Id) : IQuery<ZikrDto>;

// Commands
public record CreateZikrCommand(
    Guid CategoryId,
    string ArabicText,
    string Translation,
    string Transliteration,
    int RepeatCount,
    string Fadl,
    string Source,
    string AudioUrl = "",
    int Order = 0
) : ICommand<ZikrDto>;

public record DeleteZikrCommand(Guid Id) : ICommand<bool>;


