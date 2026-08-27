using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;
using Tasbeeh.Application.Common;
using Tasbeeh.Domain.Entities;

namespace Tasbeeh.Application.Handlers;

public class GetPresetsQueryHandler : IQueryHandler<GetPresetsQuery, IReadOnlyList<TasbeehPresetDto>>
{
    private readonly ITasbeehDbContext _context;

    public GetPresetsQueryHandler(ITasbeehDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<TasbeehPresetDto>>> Handle(GetPresetsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TasbeehPresets.AsNoTracking();

        if (!string.IsNullOrEmpty(request.DeviceIdentifier))
        {
            query = query.Where(p => !p.IsCustom || p.DeviceIdentifier == request.DeviceIdentifier);
        }
        else
        {
            query = query.Where(p => !p.IsCustom);
        }

        var presets = await query
            .Select(p => new TasbeehPresetDto(p.Id, p.Name, p.ArabicText, p.Transliteration, p.Benefit, p.TargetCount, p.IsCustom))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<TasbeehPresetDto>>(presets);
    }
}

public class CreateTasbeehPresetCommandHandler : ICommandHandler<CreateTasbeehPresetCommand, TasbeehPresetDto>
{
    private readonly ITasbeehDbContext _context;

    public CreateTasbeehPresetCommandHandler(ITasbeehDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TasbeehPresetDto>> Handle(CreateTasbeehPresetCommand request, CancellationToken cancellationToken)
    {
        var preset = TasbeehPreset.Create(
            request.Name,
            request.ArabicText,
            request.Transliteration,
            request.Benefit,
            request.TargetCount,
            request.IsCustom,
            request.DeviceIdentifier
        );

        await _context.TasbeehPresets.AddAsync(preset, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new TasbeehPresetDto(
            preset.Id,
            preset.Name,
            preset.ArabicText,
            preset.Transliteration,
            preset.Benefit,
            preset.TargetCount,
            preset.IsCustom
        );

        return Result.Success(dto);
    }
}

public class DeleteTasbeehPresetCommandHandler : ICommandHandler<DeleteTasbeehPresetCommand, bool>
{
    private readonly ITasbeehDbContext _context;

    public DeleteTasbeehPresetCommandHandler(ITasbeehDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteTasbeehPresetCommand request, CancellationToken cancellationToken)
    {
        var preset = await _context.TasbeehPresets
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (preset == null)
        {
            return Result.Failure<bool>(Error.NotFound("TasbeehPreset", request.Id));
        }

        _context.TasbeehPresets.Remove(preset);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}



