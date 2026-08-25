using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using FluentValidation;

namespace Adhkar.Application;

public record CategoryDto(Guid Id, string Name, string ArabicName, string Icon, string Description, int Order, int ZikrCount);
public record ZikrDto(Guid Id, Guid CategoryId, string ArabicText, string Translation, string Transliteration, int RepeatCount, string Fadl, string Source, string AudioUrl, int Order);
public record DailyProgressDto(Guid ZikrId, string DeviceIdentifier, int CompletedCount, bool IsCompleted, DateTime Date);

// Queries
public record GetCategoriesQuery : IQuery<IReadOnlyList<CategoryDto>>;
public record GetAdhkarByCategoryQuery(Guid CategoryId) : IQuery<IReadOnlyList<ZikrDto>>;
public record GetZikrByIdQuery(Guid Id) : IQuery<ZikrDto>;
public record GetTodayProgressQuery(string DeviceIdentifier) : IQuery<IReadOnlyList<DailyProgressDto>>;

// Commands
public record UpdateDailyProgressCommand(string DeviceIdentifier, Guid ZikrId, int CompletedCount, bool IsCompleted) : ICommand<DailyProgressDto>;

public class UpdateDailyProgressCommandValidator : AbstractValidator<UpdateDailyProgressCommand>
{
    public UpdateDailyProgressCommandValidator()
    {
        RuleFor(x => x.DeviceIdentifier).NotEmpty().WithMessage("Device identifier is required.");
        RuleFor(x => x.ZikrId).NotEmpty().WithMessage("Zikr ID is required.");
        RuleFor(x => x.CompletedCount).GreaterThanOrEqualTo(0);
    }
}
