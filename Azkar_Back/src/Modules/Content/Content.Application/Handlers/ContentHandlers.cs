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

public class GetMessagesQueryHandler : IQueryHandler<GetMessagesQuery, IReadOnlyList<DailyMessageDto>>
{
    private readonly IContentDbContext _context;

    public GetMessagesQueryHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DailyMessageDto>>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.DailyMessages.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(m => m.Category == request.Category);
        }

        var list = await query
            .OrderBy(m => m.DateFor)
            .Select(m => new DailyMessageDto(m.Id, m.Text, m.Category, m.Source, m.DateFor))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DailyMessageDto>>(list);
    }
}

public class CreateReligiousInfoCommandHandler : ICommandHandler<CreateReligiousInfoCommand, ReligiousInfoDto>
{
    private readonly IContentDbContext _context;

    public CreateReligiousInfoCommandHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReligiousInfoDto>> Handle(CreateReligiousInfoCommand request, CancellationToken cancellationToken)
    {
        var item = Content.Domain.Entities.ReligiousInfo.Create(
            request.Title,
            request.Category,
            request.Content,
            request.ReferenceSource
        );

        await _context.ReligiousInfos.AddAsync(item, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new ReligiousInfoDto(
            item.Id,
            item.Title,
            item.Category,
            item.Content,
            item.ReferenceSource
        );

        return Result.Success(dto);
    }
}

public class DeleteReligiousInfoCommandHandler : ICommandHandler<DeleteReligiousInfoCommand, bool>
{
    private readonly IContentDbContext _context;

    public DeleteReligiousInfoCommandHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteReligiousInfoCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.ReligiousInfos
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (item == null)
        {
            return Result.Failure<bool>(Error.NotFound("ReligiousInfo", request.Id));
        }

        _context.ReligiousInfos.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

public class CreateSeerahEventCommandHandler : ICommandHandler<CreateSeerahEventCommand, SeerahEventDto>
{
    private readonly IContentDbContext _context;

    public CreateSeerahEventCommandHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SeerahEventDto>> Handle(CreateSeerahEventCommand request, CancellationToken cancellationToken)
    {
        var item = Content.Domain.Entities.SeerahEvent.Create(
            request.Order,
            request.Title,
            request.Period,
            request.YearHijri,
            request.Description,
            request.LessonsLearned
        );

        await _context.SeerahEvents.AddAsync(item, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new SeerahEventDto(
            item.Id,
            item.Order,
            item.Title,
            item.Period,
            item.YearHijri,
            item.Description,
            item.LessonsLearned
        );

        return Result.Success(dto);
    }
}

public class DeleteSeerahEventCommandHandler : ICommandHandler<DeleteSeerahEventCommand, bool>
{
    private readonly IContentDbContext _context;

    public DeleteSeerahEventCommandHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteSeerahEventCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.SeerahEvents
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (item == null)
        {
            return Result.Failure<bool>(Error.NotFound("SeerahEvent", request.Id));
        }

        _context.SeerahEvents.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

public class CreateMessageCommandHandler : ICommandHandler<CreateMessageCommand, DailyMessageDto>
{
    private readonly IContentDbContext _context;

    public CreateMessageCommandHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DailyMessageDto>> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        var item = Content.Domain.Entities.DailyMessage.Create(
            request.Text,
            request.Category,
            request.Source,
            request.DateFor
        );

        await _context.DailyMessages.AddAsync(item, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DailyMessageDto(
            item.Id,
            item.Text,
            item.Category,
            item.Source,
            item.DateFor
        );

        return Result.Success(dto);
    }
}

public class DeleteMessageCommandHandler : ICommandHandler<DeleteMessageCommand, bool>
{
    private readonly IContentDbContext _context;

    public DeleteMessageCommandHandler(IContentDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.DailyMessages
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (item == null)
        {
            return Result.Failure<bool>(Error.NotFound("DailyMessage", request.Id));
        }

        _context.DailyMessages.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}




