using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Content.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace Content.Application.Handlers;

public class GetAsmaaAllahQueryHandler : IQueryHandler<GetAsmaaAllahQuery, IReadOnlyList<AsmaaAllahDto>>
{
    private readonly IContentDbContext _context;

    public GetAsmaaAllahQueryHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AsmaaAllahDto>>> Handle(GetAsmaaAllahQuery request, CancellationToken cancellationToken)
    {
        var names = await _context.AsmaaAllah
            .AsNoTracking()
            .OrderBy(n => n.Number)
            .Select(n => new AsmaaAllahDto(
                n.Id,
                n.Number,
                n.NameArabic,
                n.NameEnglish,
                n.Transliteration,
                n.MeaningArabic,
                n.MeaningEnglish,
                n.QuranOccurrences,
                n.Explanation
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<AsmaaAllahDto>>(names);
    }
}

public class GetSeerahEventsQueryHandler : IQueryHandler<GetSeerahEventsQuery, IReadOnlyList<SeerahEventDto>>
{
    private readonly IContentDbContext _context;

    public GetSeerahEventsQueryHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<SeerahEventDto>>> Handle(GetSeerahEventsQuery request, CancellationToken cancellationToken)
    {
        var events = await _context.SeerahEvents
            .AsNoTracking()
            .OrderBy(e => e.Order)
            .Select(e => new SeerahEventDto(
                e.Id,
                e.Order,
                e.Title,
                e.Period,
                e.YearHijri,
                e.Description,
                e.LessonsLearned
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<SeerahEventDto>>(events);
    }
}

public class GetReligiousInfoListQueryHandler : IQueryHandler<GetReligiousInfoListQuery, IReadOnlyList<ReligiousInfoDto>>
{
    private readonly IContentDbContext _context;

    public GetReligiousInfoListQueryHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ReligiousInfoDto>>> Handle(GetReligiousInfoListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ReligiousInfos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(r => r.Category == request.Category);
        }

        var list = await query
            .Select(r => new ReligiousInfoDto(r.Id, r.Title, r.Category, r.Content, r.ReferenceSource))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ReligiousInfoDto>>(list);
    }
}

public class GetTodayMessageQueryHandler : IQueryHandler<GetTodayMessageQuery, DailyMessageDto>
{
    private readonly IContentDbContext _context;

    public GetTodayMessageQueryHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DailyMessageDto>> Handle(GetTodayMessageQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var msg = await _context.DailyMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.DateFor == today, cancellationToken);

        if (msg == null)
        {
            msg = await _context.DailyMessages
                .AsNoTracking()
                .OrderByDescending(m => m.DateFor)
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (msg == null)
        {
            return Result.Success(new DailyMessageDto(Guid.NewGuid(), "ألا بذكر الله تطمئن القلوب", "Ayah", "سورة الرعد - آية 28", today));
        }

        return Result.Success(new DailyMessageDto(msg.Id, msg.Text, msg.Category, msg.Source, msg.DateFor));
    }
}
