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

public class GetAllAdhkarQueryHandler : IQueryHandler<GetAllAdhkarQuery, IReadOnlyList<ZikrDto>>
{
    private readonly IAdhkarDbContext _context;

    public GetAllAdhkarQueryHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ZikrDto>>> Handle(GetAllAdhkarQuery request, CancellationToken cancellationToken)
    {
        var adhkar = await _context.Adhkar
            .AsNoTracking()
            .Where(z => !z.IsDeleted)
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

public class CreateZikrCommandHandler : ICommandHandler<CreateZikrCommand, ZikrDto>
{
    private readonly IAdhkarDbContext _context;

    public CreateZikrCommandHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ZikrDto>> Handle(CreateZikrCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.ZikrCategories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (category == null)
        {
            return Result.Failure<ZikrDto>(Error.NotFound("Category", request.CategoryId));
        }

        var zikr = Zikr.Create(
            request.CategoryId,
            request.ArabicText,
            request.Translation,
            request.Transliteration,
            request.RepeatCount,
            request.Fadl,
            request.Source,
            request.AudioUrl,
            request.Order
        );

        await _context.Adhkar.AddAsync(zikr, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new ZikrDto(
            zikr.Id,
            zikr.CategoryId,
            zikr.ArabicText,
            zikr.Translation,
            zikr.Transliteration,
            zikr.RepeatCount,
            zikr.Fadl,
            zikr.Source,
            zikr.AudioUrl,
            zikr.Order
        );

        return Result.Success(dto);
    }
}

public class DeleteZikrCommandHandler : ICommandHandler<DeleteZikrCommand, bool>
{
    private readonly IAdhkarDbContext _context;

    public DeleteZikrCommandHandler(IAdhkarDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteZikrCommand request, CancellationToken cancellationToken)
    {
        var zikr = await _context.Adhkar
            .FirstOrDefaultAsync(z => z.Id == request.Id, cancellationToken);

        if (zikr == null)
        {
            return Result.Failure<bool>(Error.NotFound("Zikr", request.Id));
        }

        _context.Adhkar.Remove(zikr);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}


