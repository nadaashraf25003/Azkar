using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;
using Questions.Application.Common;
using Questions.Domain.Entities;

namespace Questions.Application.Handlers;

public class GetQuestionsQueryHandler : IQueryHandler<GetQuestionsQuery, IReadOnlyList<QuestionDto>>
{
    private readonly IQuestionsDbContext _context;

    public GetQuestionsQueryHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<QuestionDto>>> Handle(GetQuestionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Questions.AsNoTracking().Where(q => !q.IsDeleted);

        if (!request.IncludePending)
        {
            query = query.Where(q => q.IsApproved);
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(q => q.Category == request.Category);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(q => q.Title.Contains(request.SearchTerm) || q.Content.Contains(request.SearchTerm));
        }

        var questions = await query
            .OrderByDescending(q => q.CreatedAtUtc)
            .Select(q => new QuestionDto(
                q.Id,
                q.Title,
                q.Content,
                q.Category,
                q.AskerName,
                q.Upvotes,
                q.Downvotes,
                q.IsAnswered,
                q.IsApproved,
                q.Answers.Count,
                q.CreatedAtUtc,
                q.Answers
                    .Where(a => !a.IsDeleted)
                    .OrderByDescending(a => a.IsVerifiedScholar)
                    .ThenByDescending(a => a.Upvotes)
                    .Select(a => new AnswerDto(
                        a.Id,
                        a.QuestionId,
                        a.AuthorName,
                        a.Content,
                        a.ReferenceSource,
                        a.IsVerifiedScholar,
                        a.Upvotes,
                        a.Downvotes,
                        a.CreatedAtUtc
                    ))
                    .ToList()
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<QuestionDto>>(questions);
    }
}

public class GetQuestionDetailsQueryHandler : IQueryHandler<GetQuestionDetailsQuery, QuestionDetailDto>
{
    private readonly IQuestionsDbContext _context;

    public GetQuestionDetailsQueryHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<QuestionDetailDto>> Handle(GetQuestionDetailsQuery request, CancellationToken cancellationToken)
    {
        var q = await _context.Questions
            .AsNoTracking()
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == request.Id && !q.IsDeleted, cancellationToken);

        if (q == null)
        {
            return Result.Failure<QuestionDetailDto>(Error.NotFound("Question", request.Id));
        }

        var answers = q.Answers
            .Where(a => !a.IsDeleted)
            .OrderByDescending(a => a.IsVerifiedScholar)
            .ThenByDescending(a => a.Upvotes)
            .Select(a => new AnswerDto(
                a.Id,
                a.QuestionId,
                a.AuthorName,
                a.Content,
                a.ReferenceSource,
                a.IsVerifiedScholar,
                a.Upvotes,
                a.Downvotes,
                a.CreatedAtUtc
            ))
            .ToList();

        var dto = new QuestionDetailDto(
            q.Id,
            q.Title,
            q.Content,
            q.Category,
            q.AskerName,
            q.Upvotes,
            q.Downvotes,
            q.IsAnswered,
            q.IsApproved,
            q.CreatedAtUtc,
            answers
        );

        return Result.Success(dto);
    }
}

public class AskQuestionCommandHandler : ICommandHandler<AskQuestionCommand, QuestionDto>
{
    private readonly IQuestionsDbContext _context;

    public AskQuestionCommandHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<QuestionDto>> Handle(AskQuestionCommand request, CancellationToken cancellationToken)
    {
        var question = Question.Create(request.Title, request.Content, request.Category, request.AskerName, isApproved: false);
        await _context.Questions.AddAsync(question, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new QuestionDto(
            question.Id,
            question.Title,
            question.Content,
            question.Category,
            question.AskerName,
            question.Upvotes,
            question.Downvotes,
            question.IsAnswered,
            question.IsApproved,
            0,
            question.CreatedAtUtc,
            Array.Empty<AnswerDto>()
        );

        return Result.Success(dto);
    }
}

public class ApproveQuestionCommandHandler : ICommandHandler<ApproveQuestionCommand, bool>
{
    private readonly IQuestionsDbContext _context;

    public ApproveQuestionCommandHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(ApproveQuestionCommand request, CancellationToken cancellationToken)
    {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == request.Id, cancellationToken);
        if (question == null)
        {
            return Result.Failure<bool>(Error.NotFound("Question", request.Id));
        }

        question.Approve();
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(true);
    }
}

public class RejectQuestionCommandHandler : ICommandHandler<RejectQuestionCommand, bool>
{
    private readonly IQuestionsDbContext _context;

    public RejectQuestionCommandHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(RejectQuestionCommand request, CancellationToken cancellationToken)
    {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == request.Id, cancellationToken);
        if (question == null)
        {
            return Result.Failure<bool>(Error.NotFound("Question", request.Id));
        }

        question.Reject();
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(true);
    }
}

public class AddAnswerCommandHandler : ICommandHandler<AddAnswerCommand, AnswerDto>
{
    private readonly IQuestionsDbContext _context;

    public AddAnswerCommandHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AnswerDto>> Handle(AddAnswerCommand request, CancellationToken cancellationToken)
    {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == request.QuestionId, cancellationToken);
        if (question == null)
        {
            return Result.Failure<AnswerDto>(Error.NotFound("Question", request.QuestionId));
        }

        var answer = Answer.Create(request.QuestionId, request.AuthorName, request.Content, request.ReferenceSource);
        await _context.Answers.AddAsync(answer, cancellationToken);
        question.MarkAnswered();
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AnswerDto(
            answer.Id,
            answer.QuestionId,
            answer.AuthorName,
            answer.Content,
            answer.ReferenceSource,
            answer.IsVerifiedScholar,
            answer.Upvotes,
            answer.Downvotes,
            answer.CreatedAtUtc
        );

        return Result.Success(dto);
    }
}

public class DeleteQuestionCommandHandler : ICommandHandler<DeleteQuestionCommand, bool>
{
    private readonly IQuestionsDbContext _context;

    public DeleteQuestionCommandHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteQuestionCommand request, CancellationToken cancellationToken)
    {
        var question = await _context.Questions
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == request.Id, cancellationToken);

        if (question == null)
        {
            return Result.Failure<bool>(Error.NotFound("Question", request.Id));
        }

        if (question.Answers.Any())
        {
            _context.Answers.RemoveRange(question.Answers);
        }

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

public class DeleteAnswerCommandHandler : ICommandHandler<DeleteAnswerCommand, bool>
{
    private readonly IQuestionsDbContext _context;

    public DeleteAnswerCommandHandler(IQuestionsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteAnswerCommand request, CancellationToken cancellationToken)
    {
        var answer = await _context.Answers.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);
        if (answer == null)
        {
            return Result.Failure<bool>(Error.NotFound("Answer", request.Id));
        }

        var questionId = answer.QuestionId;
        _context.Answers.Remove(answer);
        await _context.SaveChangesAsync(cancellationToken);

        // Update IsAnswered flag if no answers left
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == questionId, cancellationToken);
        if (question != null)
        {
            var remainingAnswers = await _context.Answers.AnyAsync(a => a.QuestionId == questionId, cancellationToken);
            question.UpdateIsAnswered(remainingAnswers);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Success(true);
    }
}
