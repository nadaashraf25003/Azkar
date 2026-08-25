using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Kids.Application.Common;
using Kids.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Kids.Application.Handlers;

public class GetKidsStoriesQueryHandler : IQueryHandler<GetKidsStoriesQuery, IReadOnlyList<KidsStoryDto>>
{
    private readonly IKidsDbContext _context;

    public GetKidsStoriesQueryHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<KidsStoryDto>>> Handle(GetKidsStoriesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.KidsStories.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.AgeGroup))
        {
            query = query.Where(s => s.AgeGroup == request.AgeGroup);
        }

        var stories = await query
            .Select(s => new KidsStoryDto(s.Id, s.Title, s.AgeGroup, s.Content, s.MoralLesson, s.CoverImageUrl, s.AudioUrl))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<KidsStoryDto>>(stories);
    }
}

public class GetKidsChallengesQueryHandler : IQueryHandler<GetKidsChallengesQuery, IReadOnlyList<KidsChallengeDto>>
{
    private readonly IKidsDbContext _context;

    public GetKidsChallengesQueryHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<KidsChallengeDto>>> Handle(GetKidsChallengesQuery request, CancellationToken cancellationToken)
    {
        var challenges = await _context.KidsChallenges
            .AsNoTracking()
            .Select(c => new KidsChallengeDto(c.Id, c.Title, c.Description, c.Points, c.Category, c.BadgeIcon))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<KidsChallengeDto>>(challenges);
    }
}

public class GetKidsQuizQuestionsQueryHandler : IQueryHandler<GetKidsQuizQuestionsQuery, IReadOnlyList<KidsQuizQuestionDto>>
{
    private readonly IKidsDbContext _context;

    public GetKidsQuizQuestionsQueryHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<KidsQuizQuestionDto>>> Handle(GetKidsQuizQuestionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.KidsQuizQuestions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(q => q.Category == request.Category);
        }

        var questions = await query
            .Select(q => new KidsQuizQuestionDto(q.Id, q.QuestionText, q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.CorrectOptionIndex, q.Explanation, q.Category))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<KidsQuizQuestionDto>>(questions);
    }
}

public class GetKidsProgressQueryHandler : IQueryHandler<GetKidsProgressQuery, KidsProgressDto>
{
    private readonly IKidsDbContext _context;

    public GetKidsProgressQueryHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<KidsProgressDto>> Handle(GetKidsProgressQuery request, CancellationToken cancellationToken)
    {
        var progress = await _context.KidsProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.DeviceIdentifier == request.DeviceIdentifier, cancellationToken);

        if (progress == null)
        {
            return Result.Success(new KidsProgressDto(request.DeviceIdentifier, 0, 0, 0, 0));
        }

        return Result.Success(new KidsProgressDto(progress.DeviceIdentifier, progress.TotalPoints, progress.CompletedStoriesCount, progress.CompletedChallengesCount, progress.QuizzesTakenCount));
    }
}

public class AddKidsPointsCommandHandler : ICommandHandler<AddKidsPointsCommand, KidsProgressDto>
{
    private readonly IKidsDbContext _context;

    public AddKidsPointsCommandHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<KidsProgressDto>> Handle(AddKidsPointsCommand request, CancellationToken cancellationToken)
    {
        var progress = await _context.KidsProgresses
            .FirstOrDefaultAsync(p => p.DeviceIdentifier == request.DeviceIdentifier, cancellationToken);

        if (progress == null)
        {
            progress = KidsProgress.Create(request.DeviceIdentifier);
            await _context.KidsProgresses.AddAsync(progress, cancellationToken);
        }

        progress.AddPoints(request.Points);

        if (request.ActivityType == "Story") progress.IncrementStories();
        else if (request.ActivityType == "Challenge") progress.IncrementChallenges();

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new KidsProgressDto(progress.DeviceIdentifier, progress.TotalPoints, progress.CompletedStoriesCount, progress.CompletedChallengesCount, progress.QuizzesTakenCount));
    }
}
