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

public class RecordSessionCommandHandler : ICommandHandler<RecordSessionCommand, TasbeehSessionDto>
{
    private readonly ITasbeehDbContext _context;

    public RecordSessionCommandHandler(ITasbeehDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TasbeehSessionDto>> Handle(RecordSessionCommand request, CancellationToken cancellationToken)
    {
        var session = TasbeehSession.Create(request.DeviceIdentifier, request.PresetId, request.ZikrName, request.TotalCount);
        await _context.TasbeehSessions.AddAsync(session, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new TasbeehSessionDto(session.Id, session.DeviceIdentifier, session.PresetId, session.ZikrName, session.TotalCount, session.CreatedAtUtc));
    }
}

public class GetTasbeehStatsQueryHandler : IQueryHandler<GetStatsQuery, TasbeehStatsDto>
{
    private readonly ITasbeehDbContext _context;

    public GetTasbeehStatsQueryHandler(ITasbeehDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TasbeehStatsDto>> Handle(GetStatsQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var sessions = await _context.TasbeehSessions
            .AsNoTracking()
            .Where(s => s.DeviceIdentifier == request.DeviceIdentifier)
            .ToListAsync(cancellationToken);

        var todayCount = sessions.Where(s => s.CreatedAtUtc.Date == today).Sum(s => s.TotalCount);
        var totalCount = sessions.Sum(s => s.TotalCount);
        var sessionsCount = sessions.Count;

        return Result.Success(new TasbeehStatsDto(todayCount, totalCount, sessionsCount));
    }
}
