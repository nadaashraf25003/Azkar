using Adhkar.Application.Common;
using Adhkar.Domain.Entities;
using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;

namespace Adhkar.Application.Handlers;

public class GetCategoriesQueryHandler : IQueryHandler<GetCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    private readonly IAdhkarDbContext _context;

    public GetCategoriesQueryHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.ZikrCategories
            .AsNoTracking()
            .OrderBy(c => c.Order)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.ArabicName,
                c.Icon,
                c.Description,
                c.Order,
                c.Adhkar.Count
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<CategoryDto>>(categories);
    }
}

public class GetAdhkarByCategoryQueryHandler : IQueryHandler<GetAdhkarByCategoryQuery, IReadOnlyList<ZikrDto>>
{
    private readonly IAdhkarDbContext _context;

    public GetAdhkarByCategoryQueryHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ZikrDto>>> Handle(GetAdhkarByCategoryQuery request, CancellationToken cancellationToken)
    {
        var adhkar = await _context.Adhkar
            .AsNoTracking()
            .Where(z => z.CategoryId == request.CategoryId && !z.IsDeleted)
            .OrderBy(z => z.Order)
            .Select(z => new ZikrDto(
                z.Id,
                z.CategoryId,
                z.ArabicText,
                z.Translation,
                z.Transliteration,
                z.RepeatCount,
                z.Fadl,
                z.Source,
                z.AudioUrl,
                z.Order
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ZikrDto>>(adhkar);
    }
}

public class GetZikrByIdQueryHandler : IQueryHandler<GetZikrByIdQuery, ZikrDto>
{
    private readonly IAdhkarDbContext _context;

    public GetZikrByIdQueryHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ZikrDto>> Handle(GetZikrByIdQuery request, CancellationToken cancellationToken)
    {
        var z = await _context.Adhkar
            .AsNoTracking()
            .FirstOrDefaultAsync(z => z.Id == request.Id && !z.IsDeleted, cancellationToken);

        if (z is null)
        {
            return Result.Failure<ZikrDto>(Error.NotFound("Zikr", request.Id));
        }

        var dto = new ZikrDto(
            z.Id,
            z.CategoryId,
            z.ArabicText,
            z.Translation,
            z.Transliteration,
            z.RepeatCount,
            z.Fadl,
            z.Source,
            z.AudioUrl,
            z.Order);

        return Result.Success(dto);
    }
}

public class GetTodayProgressQueryHandler : IQueryHandler<GetTodayProgressQuery, IReadOnlyList<DailyProgressDto>>
{
    private readonly IAdhkarDbContext _context;

    public GetTodayProgressQueryHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DailyProgressDto>>> Handle(GetTodayProgressQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var progressList = await _context.DailyProgresses
            .AsNoTracking()
            .Where(p => p.DeviceIdentifier == request.DeviceIdentifier && p.Date == today)
            .Select(p => new DailyProgressDto(p.ZikrId, p.DeviceIdentifier, p.CompletedCount, p.IsCompleted, p.Date))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DailyProgressDto>>(progressList);
    }
}

public class UpdateDailyProgressCommandHandler : ICommandHandler<UpdateDailyProgressCommand, DailyProgressDto>
{
    private readonly IAdhkarDbContext _context;

    public UpdateDailyProgressCommandHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DailyProgressDto>> Handle(UpdateDailyProgressCommand request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var progress = await _context.DailyProgresses
            .FirstOrDefaultAsync(p => p.DeviceIdentifier == request.DeviceIdentifier && p.Date == today && p.ZikrId == request.ZikrId, cancellationToken);

        if (progress == null)
        {
            progress = DailyProgress.Create(request.DeviceIdentifier, request.ZikrId, request.CompletedCount, request.IsCompleted);
            await _context.DailyProgresses.AddAsync(progress, cancellationToken);
        }
        else
        {
            progress.UpdateProgress(request.CompletedCount, request.IsCompleted);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DailyProgressDto(progress.ZikrId, progress.DeviceIdentifier, progress.CompletedCount, progress.IsCompleted, progress.Date);
        return Result.Success(dto);
    }
}
