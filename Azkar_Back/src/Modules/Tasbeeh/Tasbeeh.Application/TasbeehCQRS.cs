using BuildingBlocks.Application.CQRS;
using FluentValidation;

namespace Tasbeeh.Application;

public record TasbeehPresetDto(Guid Id, string Name, string ArabicText, string Transliteration, string Benefit, int TargetCount, bool IsCustom);

// Queries
public record GetPresetsQuery(string? DeviceIdentifier = null) : IQuery<IReadOnlyList<TasbeehPresetDto>>;

// Commands
public record CreateTasbeehPresetCommand(string Name, string ArabicText, string Transliteration, string Benefit, int TargetCount, bool IsCustom = false, string? DeviceIdentifier = null) : ICommand<TasbeehPresetDto>;
public record DeleteTasbeehPresetCommand(Guid Id) : ICommand<bool>;

