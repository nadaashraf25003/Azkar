using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;
using Recitations.Application.Common;
using Recitations.Domain.Entities;

namespace Recitations.Application.Handlers;

public class GetApprovedRecitationsQueryHandler : IQueryHandler<GetApprovedRecitationsQuery, IReadOnlyList<RecitationDto>>
{
    private readonly IRecitationsDbContext _context;

    public GetApprovedRecitationsQueryHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<RecitationDto>>> Handle(GetApprovedRecitationsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Recitations
            .AsNoTracking()
            .Where(r => r.Status == ModerationStatus.Approved && !r.IsDeleted);

        if (request.SurahNumber.HasValue)
        {
            query = query.Where(r => r.SurahNumber == request.SurahNumber.Value);
        }

        var list = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new RecitationDto(
                r.Id,
                r.Title,
                r.ReciterName,
                r.AudioUrl,
                r.SurahNumber,
                r.FromAyah,
                r.ToAyah,
                r.DurationSeconds,
                r.Status,
                r.AverageRating,
                r.RatingsCount,
                r.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<RecitationDto>>(list);
    }
}

public class SubmitRecitationCommandHandler : ICommandHandler<SubmitRecitationCommand, RecitationDto>
{
    private readonly IRecitationsDbContext _context;

    public SubmitRecitationCommandHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RecitationDto>> Handle(SubmitRecitationCommand request, CancellationToken cancellationToken)
    {
        var recitation = Recitation.Create(
            request.Title,
            request.ReciterName,
            request.AudioUrl,
            request.SurahNumber,
            request.FromAyah,
            request.ToAyah,
            request.DurationSeconds);

        await _context.Recitations.AddAsync(recitation, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new RecitationDto(
            recitation.Id,
            recitation.Title,
            recitation.ReciterName,
            recitation.AudioUrl,
            recitation.SurahNumber,
            recitation.FromAyah,
            recitation.ToAyah,
            recitation.DurationSeconds,
            recitation.Status,
            recitation.AverageRating,
            recitation.RatingsCount,
            recitation.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public class RateRecitationCommandHandler : ICommandHandler<RateRecitationCommand, RecitationRatingDto>
{
    private readonly IRecitationsDbContext _context;

    public RateRecitationCommandHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RecitationRatingDto>> Handle(RateRecitationCommand request, CancellationToken cancellationToken)
    {
        var recitation = await _context.Recitations.FirstOrDefaultAsync(r => r.Id == request.RecitationId, cancellationToken);
        if (recitation == null)
        {
            return Result.Failure<RecitationRatingDto>(Error.NotFound("Recitation", request.RecitationId));
        }

        var existingRating = await _context.RecitationRatings
            .FirstOrDefaultAsync(r => r.RecitationId == request.RecitationId && r.DeviceIdentifier == request.DeviceIdentifier, cancellationToken);

        if (existingRating != null)
        {
            return Result.Failure<RecitationRatingDto>(Error.Validation("Rating.AlreadySubmitted", "You have already rated this recitation."));
        }

        var rating = RecitationRating.Create(request.RecitationId, request.DeviceIdentifier, request.Score);
        await _context.RecitationRatings.AddAsync(rating, cancellationToken);
        recitation.AddRating(request.Score);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new RecitationRatingDto(recitation.Id, recitation.AverageRating, recitation.RatingsCount));
    }
}
