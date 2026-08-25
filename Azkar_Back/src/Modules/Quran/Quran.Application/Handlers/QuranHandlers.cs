using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;
using Quran.Application.Common;

namespace Quran.Application.Handlers;

public class GetSurahsQueryHandler : IQueryHandler<GetSurahsQuery, IReadOnlyList<SurahDto>>
{
    private readonly IQuranDbContext _context;

    public GetSurahsQueryHandler(IQuranDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<SurahDto>>> Handle(GetSurahsQuery request, CancellationToken cancellationToken)
    {
        var surahs = await _context.Surahs
            .AsNoTracking()
            .OrderBy(s => s.Number)
            .Select(s => new SurahDto(
                s.Id,
                s.Number,
                s.NameArabic,
                s.NameEnglish,
                s.NameTranslation,
                s.RevelationType,
                s.VersesCount
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<SurahDto>>(surahs);
    }
}

public class GetSurahByNumberQueryHandler : IQueryHandler<GetSurahByNumberQuery, SurahDto>
{
    private readonly IQuranDbContext _context;

    public GetSurahByNumberQueryHandler(IQuranDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SurahDto>> Handle(GetSurahByNumberQuery request, CancellationToken cancellationToken)
    {
        var s = await _context.Surahs
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Number == request.Number, cancellationToken);

        if (s == null)
        {
            return Result.Failure<SurahDto>(Error.NotFound("Surah", request.Number));
        }

        var dto = new SurahDto(s.Id, s.Number, s.NameArabic, s.NameEnglish, s.NameTranslation, s.RevelationType, s.VersesCount);
        return Result.Success(dto);
    }
}

public class GetAyatBySurahQueryHandler : IQueryHandler<GetAyatBySurahQuery, IReadOnlyList<AyahDto>>
{
    private readonly IQuranDbContext _context;

    public GetAyatBySurahQueryHandler(IQuranDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AyahDto>>> Handle(GetAyatBySurahQuery request, CancellationToken cancellationToken)
    {
        var ayat = await _context.Ayat
            .AsNoTracking()
            .Where(a => a.SurahNumber == request.SurahNumber)
            .OrderBy(a => a.NumberInSurah)
            .Select(a => new AyahDto(
                a.Id,
                a.SurahId,
                a.SurahNumber,
                a.NumberInSurah,
                a.NumberInQuran,
                a.Juz,
                a.Page,
                a.ArabicText,
                a.Translation,
                a.Transliteration,
                a.AudioUrl
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<AyahDto>>(ayat);
    }
}

public class GetTafsirByAyahQueryHandler : IQueryHandler<GetTafsirByAyahQuery, TafsirDto>
{
    private readonly IQuranDbContext _context;

    public GetTafsirByAyahQueryHandler(IQuranDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TafsirDto>> Handle(GetTafsirByAyahQuery request, CancellationToken cancellationToken)
    {
        var ayah = await _context.Ayat
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.SurahNumber == request.SurahNumber && a.NumberInSurah == request.AyahNumber, cancellationToken);

        if (ayah == null)
        {
            return Result.Failure<TafsirDto>(Error.NotFound("Ayah", $"{request.SurahNumber}:{request.AyahNumber}"));
        }

        var tafsir = await _context.Tafsirs
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.AyahId == ayah.Id && (string.IsNullOrEmpty(request.TafsirName) || t.TafsirName == request.TafsirName), cancellationToken);

        if (tafsir == null)
        {
            return Result.Failure<TafsirDto>(Error.NotFound("Tafsir", ayah.Id));
        }

        return Result.Success(new TafsirDto(tafsir.Id, tafsir.AyahId, tafsir.TafsirName, tafsir.Author, tafsir.Text));
    }
}

public class GetRecitersQueryHandler : IQueryHandler<GetRecitersQuery, IReadOnlyList<ReciterDto>>
{
    private readonly IQuranDbContext _context;

    public GetRecitersQueryHandler(IQuranDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ReciterDto>>> Handle(GetRecitersQuery request, CancellationToken cancellationToken)
    {
        var reciters = await _context.Reciters
            .AsNoTracking()
            .OrderBy(r => r.NameArabic)
            .Select(r => new ReciterDto(r.Id, r.NameArabic, r.NameEnglish, r.Style, r.ServerUrl, r.ImageUrl))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ReciterDto>>(reciters);
    }
}
