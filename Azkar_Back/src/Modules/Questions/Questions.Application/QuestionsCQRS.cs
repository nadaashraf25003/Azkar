using BuildingBlocks.Application.CQRS;
using FluentValidation;

namespace Questions.Application;

public record QuestionDto(Guid Id, string Title, string Content, string Category, string AskerName, int Upvotes, int Downvotes, bool IsAnswered, int AnswersCount, DateTime CreatedAtUtc);
public record AnswerDto(Guid Id, Guid QuestionId, string AuthorName, string Content, string ReferenceSource, bool IsVerifiedScholar, int Upvotes, int Downvotes, DateTime CreatedAtUtc);
public record QuestionDetailDto(Guid Id, string Title, string Content, string Category, string AskerName, int Upvotes, int Downvotes, bool IsAnswered, DateTime CreatedAtUtc, IReadOnlyList<AnswerDto> Answers);

// Queries
public record GetQuestionsQuery(string? Category = null, string? SearchTerm = null) : IQuery<IReadOnlyList<QuestionDto>>;
public record GetQuestionDetailsQuery(Guid Id) : IQuery<QuestionDetailDto>;

// Commands
public record AskQuestionCommand(string Title, string Content, string Category, string AskerName) : ICommand<QuestionDto>;
public record AddAnswerCommand(Guid QuestionId, string AuthorName, string Content, string ReferenceSource = "") : ICommand<AnswerDto>;
public record VoteCommand(string TargetType, Guid TargetId, string DeviceIdentifier, bool IsUpvote) : ICommand<bool>;

public class AskQuestionCommandValidator : AbstractValidator<AskQuestionCommand>
{
    public AskQuestionCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Content).NotEmpty().MaximumLength(4000);
    }
}

public class AddAnswerCommandValidator : AbstractValidator<AddAnswerCommand>
{
    public AddAnswerCommandValidator()
    {
        RuleFor(x => x.QuestionId).NotEmpty();
        RuleFor(x => x.Content).NotEmpty().MaximumLength(4000);
    }
}
