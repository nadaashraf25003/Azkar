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

// Stories Handlers
public class CreateKidsStoryCommandHandler : ICommandHandler<CreateKidsStoryCommand, KidsStoryDto>
{
    private readonly IKidsDbContext _context;

    public CreateKidsStoryCommandHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<KidsStoryDto>> Handle(CreateKidsStoryCommand request, CancellationToken cancellationToken)
    {
        var story = KidsStory.Create(
            request.Title,
            request.AgeGroup,
            request.Content,
            request.MoralLesson,
            request.CoverImageUrl,
            request.AudioUrl
        );

        await _context.KidsStories.AddAsync(story, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new KidsStoryDto(
            story.Id,
            story.Title,
            story.AgeGroup,
            story.Content,
            story.MoralLesson,
            story.CoverImageUrl,
            story.AudioUrl
        );

        return Result.Success(dto);
    }
}

public class DeleteKidsStoryCommandHandler : ICommandHandler<DeleteKidsStoryCommand, bool>
{
    private readonly IKidsDbContext _context;

    public DeleteKidsStoryCommandHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteKidsStoryCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.KidsStories
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (item == null)
        {
            return Result.Failure<bool>(Error.NotFound("KidsStory", request.Id));
        }

        _context.KidsStories.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

// Challenges Handlers
public class CreateKidsChallengeCommandHandler : ICommandHandler<CreateKidsChallengeCommand, KidsChallengeDto>
{
    private readonly IKidsDbContext _context;

    public CreateKidsChallengeCommandHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<KidsChallengeDto>> Handle(CreateKidsChallengeCommand request, CancellationToken cancellationToken)
    {
        var challenge = KidsChallenge.Create(
            request.Title,
            request.Description,
            request.Points,
            request.Category,
            request.BadgeIcon
        );

        await _context.KidsChallenges.AddAsync(challenge, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new KidsChallengeDto(
            challenge.Id,
            challenge.Title,
            challenge.Description,
            challenge.Points,
            challenge.Category,
            challenge.BadgeIcon
        );

        return Result.Success(dto);
    }
}

public class DeleteKidsChallengeCommandHandler : ICommandHandler<DeleteKidsChallengeCommand, bool>
{
    private readonly IKidsDbContext _context;

    public DeleteKidsChallengeCommandHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteKidsChallengeCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.KidsChallenges
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (item == null)
        {
            return Result.Failure<bool>(Error.NotFound("KidsChallenge", request.Id));
        }

        _context.KidsChallenges.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

// Quizzes Handlers
public class CreateKidsQuizQuestionCommandHandler : ICommandHandler<CreateKidsQuizQuestionCommand, KidsQuizQuestionDto>
{
    private readonly IKidsDbContext _context;

    public CreateKidsQuizQuestionCommandHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<KidsQuizQuestionDto>> Handle(CreateKidsQuizQuestionCommand request, CancellationToken cancellationToken)
    {
        var quiz = KidsQuizQuestion.Create(
            request.QuestionText,
            request.OptionA,
            request.OptionB,
            request.OptionC,
            request.OptionD,
            request.CorrectOptionIndex,
            request.Explanation,
            request.Category
        );

        await _context.KidsQuizQuestions.AddAsync(quiz, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new KidsQuizQuestionDto(
            quiz.Id,
            quiz.QuestionText,
            quiz.OptionA,
            quiz.OptionB,
            quiz.OptionC,
            quiz.OptionD,
            quiz.CorrectOptionIndex,
            quiz.Explanation,
            quiz.Category
        );

        return Result.Success(dto);
    }
}

public class DeleteKidsQuizQuestionCommandHandler : ICommandHandler<DeleteKidsQuizQuestionCommand, bool>
{
    private readonly IKidsDbContext _context;

    public DeleteKidsQuizQuestionCommandHandler(IKidsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteKidsQuizQuestionCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.KidsQuizQuestions
            .FirstOrDefaultAsync(q => q.Id == request.Id, cancellationToken);

        if (item == null)
        {
            return Result.Failure<bool>(Error.NotFound("KidsQuizQuestion", request.Id));
        }

        _context.KidsQuizQuestions.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}


