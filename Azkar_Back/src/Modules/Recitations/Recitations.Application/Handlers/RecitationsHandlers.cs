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
            .Where(r => !r.IsDeleted);

        if (!request.IncludePending)
        {
            query = query.Where(r => r.Status == ModerationStatus.Approved);
        }

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
                r.CreatedAtUtc,
                r.Comments
                    .Where(c => !c.IsDeleted)
                    .OrderByDescending(c => c.CreatedAtUtc)
                    .Select(c => new RecitationCommentDto(
                        c.Id,
                        c.RecitationId,
                        c.AuthorName,
                        c.Content,
                        c.CreatedAtUtc
                    ))
                    .ToList()
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
            recitation.CreatedAtUtc,
            Array.Empty<RecitationCommentDto>());

        return Result.Success(dto);
    }
}

public class ApproveRecitationCommandHandler : ICommandHandler<ApproveRecitationCommand, bool>
{
    private readonly IRecitationsDbContext _context;

    public ApproveRecitationCommandHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(ApproveRecitationCommand request, CancellationToken cancellationToken)
    {
        var recitation = await _context.Recitations.FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (recitation == null)
        {
            return Result.Failure<bool>(Error.NotFound("Recitation", request.Id));
        }

        recitation.Approve();
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(true);
    }
}

public class RejectRecitationCommandHandler : ICommandHandler<RejectRecitationCommand, bool>
{
    private readonly IRecitationsDbContext _context;

    public RejectRecitationCommandHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(RejectRecitationCommand request, CancellationToken cancellationToken)
    {
        var recitation = await _context.Recitations.FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (recitation == null)
        {
            return Result.Failure<bool>(Error.NotFound("Recitation", request.Id));
        }

        recitation.Reject();
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(true);
    }
}

public class DeleteRecitationCommandHandler : ICommandHandler<DeleteRecitationCommand, bool>
{
    private readonly IRecitationsDbContext _context;

    public DeleteRecitationCommandHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteRecitationCommand request, CancellationToken cancellationToken)
    {
        var recitation = await _context.Recitations
            .Include(r => r.Comments)
            .Include(r => r.Ratings)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (recitation == null)
        {
            return Result.Failure<bool>(Error.NotFound("Recitation", request.Id));
        }

        if (recitation.Comments.Any())
        {
            _context.RecitationComments.RemoveRange(recitation.Comments);
        }

        if (recitation.Ratings.Any())
        {
            _context.RecitationRatings.RemoveRange(recitation.Ratings);
        }

        _context.Recitations.Remove(recitation);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

public class AddRecitationCommentCommandHandler : ICommandHandler<AddRecitationCommentCommand, RecitationCommentDto>
{
    private readonly IRecitationsDbContext _context;

    public AddRecitationCommentCommandHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RecitationCommentDto>> Handle(AddRecitationCommentCommand request, CancellationToken cancellationToken)
    {
        var recitation = await _context.Recitations.FirstOrDefaultAsync(r => r.Id == request.RecitationId, cancellationToken);
        if (recitation == null)
        {
            return Result.Failure<RecitationCommentDto>(Error.NotFound("Recitation", request.RecitationId));
        }

        var comment = RecitationComment.Create(request.RecitationId, request.AuthorName, request.Content);
        await _context.RecitationComments.AddAsync(comment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new RecitationCommentDto(
            comment.Id,
            comment.RecitationId,
            comment.AuthorName,
            comment.Content,
            comment.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public class DeleteRecitationCommentCommandHandler : ICommandHandler<DeleteRecitationCommentCommand, bool>
{
    private readonly IRecitationsDbContext _context;

    public DeleteRecitationCommentCommandHandler(IRecitationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteRecitationCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _context.RecitationComments.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (comment == null)
        {
            return Result.Failure<bool>(Error.NotFound("RecitationComment", request.Id));
        }

        _context.RecitationComments.Remove(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
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
            existingRating.UpdateScore(request.Score);
        }
        else
        {
            var rating = RecitationRating.Create(request.RecitationId, request.DeviceIdentifier, request.Score);
            await _context.RecitationRatings.AddAsync(rating, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Recalculate average rating & count
        var ratings = await _context.RecitationRatings
            .Where(r => r.RecitationId == request.RecitationId)
            .ToListAsync(cancellationToken);

        var count = ratings.Count;
        var avg = count > 0 ? Math.Round(ratings.Average(r => r.Score), 2) : 0;
        recitation.SetRating(avg, count);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new RecitationRatingDto(recitation.Id, recitation.AverageRating, recitation.RatingsCount));
    }
}
