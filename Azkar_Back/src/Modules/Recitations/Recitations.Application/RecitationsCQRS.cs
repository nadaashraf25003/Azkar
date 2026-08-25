using BuildingBlocks.Application.CQRS;
using FluentValidation;
using Recitations.Domain.Entities;

namespace Recitations.Application;

public record RecitationDto(Guid Id, string Title, string ReciterName, string AudioUrl, int SurahNumber, int FromAyah, int ToAyah, int DurationSeconds, ModerationStatus Status, double AverageRating, int RatingsCount, DateTime CreatedAtUtc);
public record RecitationCommentDto(Guid Id, Guid RecitationId, string AuthorName, string Content, DateTime CreatedAtUtc);
public record RecitationRatingDto(Guid RecitationId, double AverageRating, int RatingsCount);

// Queries
public record GetApprovedRecitationsQuery(int? SurahNumber = null) : IQuery<IReadOnlyList<RecitationDto>>;
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
        RuleFor(x => x.AudioUrl).NotEmpty().Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _)).WithMessage("A valid audio URL is required.");
        RuleFor(x => x.SurahNumber).InclusiveBetween(1, 114);
        RuleFor(x => x.FromAyah).GreaterThan(0);
        RuleFor(x => x.ToAyah).GreaterThanOrEqualTo(x => x.FromAyah);
    }
}

public record AddRecitationCommentCommand(Guid RecitationId, string AuthorName, string Content) : ICommand<RecitationCommentDto>;
public record RateRecitationCommand(Guid RecitationId, string DeviceIdentifier, int Score) : ICommand<RecitationRatingDto>;
