using BuildingBlocks.Application.CQRS;
using FluentValidation;

namespace Tasbeeh.Application;

public record TasbeehPresetDto(Guid Id, string Name, string ArabicText, string Transliteration, string Benefit, int TargetCount, bool IsCustom);
public record TasbeehSessionDto(Guid Id, string DeviceIdentifier, Guid? PresetId, string ZikrName, int TotalCount, DateTime CreatedAtUtc);
public record TasbeehStatsDto(int TotalCountToday, int TotalCountAllTime, int TotalSessionsCount);

// Queries
public record GetPresetsQuery(string? DeviceIdentifier = null) : IQuery<IReadOnlyList<TasbeehPresetDto>>;
public record GetSessionsQuery(string DeviceIdentifier) : IQuery<IReadOnlyList<TasbeehSessionDto>>;
public record GetStatsQuery(string DeviceIdentifier) : IQuery<TasbeehStatsDto>;

// Commands
public record RecordSessionCommand(string DeviceIdentifier, Guid? PresetId, string ZikrName, int TotalCount) : ICommand<TasbeehSessionDto>;
public record CreateCustomPresetCommand(string DeviceIdentifier, string Name, string ArabicText, string Transliteration, string Benefit, int TargetCount) : ICommand<TasbeehPresetDto>;

public class RecordSessionCommandValidator : AbstractValidator<RecordSessionCommand>
{
    public RecordSessionCommandValidator()
    {
        RuleFor(x => x.DeviceIdentifier).NotEmpty();
        RuleFor(x => x.ZikrName).NotEmpty();
        RuleFor(x => x.TotalCount).GreaterThan(0);
    }
}
