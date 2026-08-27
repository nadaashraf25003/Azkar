using BuildingBlocks.Application.CQRS;
using FluentValidation;
using Recitations.Domain.Entities;

namespace Recitations.Application;

public record RecitationCommentDto(Guid Id, Guid RecitationId, string AuthorName, string Content, DateTime CreatedAtUtc);
public record RecitationRatingDto(Guid RecitationId, double AverageRating, int RatingsCount);
public record RecitationDto(
    Guid Id,
    string Title,
    string ReciterName,
    string AudioUrl,
    int SurahNumber,
    int FromAyah,
    int ToAyah,
    int DurationSeconds,
    ModerationStatus Status,
    double AverageRating,
    int RatingsCount,
    DateTime CreatedAtUtc,
    IReadOnlyList<RecitationCommentDto> Comments
);

// Queries
public record GetApprovedRecitationsQuery(int? SurahNumber = null, bool IncludePending = false) : IQuery<IReadOnlyList<RecitationDto>>;
public record GetRecitationByIdQuery(Guid Id) : IQuery<RecitationDto>;
public record GetRecitationCommentsQuery(Guid RecitationId) : IQuery<IReadOnlyList<RecitationCommentDto>>;

// Commands
public record SubmitRecitationCommand(
    string Title,
    string ReciterName,
    string AudioUrl,
    int SurahNumber,
    int FromAyah,
    int ToAyah,
    int DurationSeconds) : ICommand<RecitationDto>;

public class SubmitRecitationCommandValidator : AbstractValidator<SubmitRecitationCommand>
{
    public SubmitRecitationCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ReciterName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.AudioUrl).NotEmpty();
    }
}

public record ApproveRecitationCommand(Guid Id) : ICommand<bool>;
public record RejectRecitationCommand(Guid Id) : ICommand<bool>;
public record DeleteRecitationCommand(Guid Id) : ICommand<bool>;
public record AddRecitationCommentCommand(Guid RecitationId, string AuthorName, string Content) : ICommand<RecitationCommentDto>;
public record DeleteRecitationCommentCommand(Guid Id) : ICommand<bool>;
public record RateRecitationCommand(Guid RecitationId, string DeviceIdentifier, int Score) : ICommand<RecitationRatingDto>;
