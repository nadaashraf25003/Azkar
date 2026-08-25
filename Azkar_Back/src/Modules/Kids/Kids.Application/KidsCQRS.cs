using BuildingBlocks.Application.CQRS;

namespace Kids.Application;

public record KidsStoryDto(Guid Id, string Title, string AgeGroup, string Content, string MoralLesson, string CoverImageUrl, string AudioUrl);
public record KidsChallengeDto(Guid Id, string Title, string Description, int Points, string Category, string BadgeIcon);
public record KidsQuizQuestionDto(Guid Id, string QuestionText, string OptionA, string OptionB, string OptionC, string OptionD, int CorrectOptionIndex, string Explanation, string Category);
public record KidsProgressDto(string DeviceIdentifier, int TotalPoints, int CompletedStoriesCount, int CompletedChallengesCount, int QuizzesTakenCount);

// Queries
public record GetKidsStoriesQuery(string? AgeGroup = null) : IQuery<IReadOnlyList<KidsStoryDto>>;
public record GetKidsChallengesQuery : IQuery<IReadOnlyList<KidsChallengeDto>>;
public record GetKidsQuizQuestionsQuery(string? Category = null) : IQuery<IReadOnlyList<KidsQuizQuestionDto>>;
public record GetKidsProgressQuery(string DeviceIdentifier) : IQuery<KidsProgressDto>;

// Commands
public record AddKidsPointsCommand(string DeviceIdentifier, int Points, string ActivityType) : ICommand<KidsProgressDto>;
