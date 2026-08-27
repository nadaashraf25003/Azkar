using BuildingBlocks.Application.CQRS;

namespace Kids.Application;

public record KidsStoryDto(Guid Id, string Title, string AgeGroup, string Content, string MoralLesson, string CoverImageUrl, string AudioUrl);
public record KidsChallengeDto(Guid Id, string Title, string Description, int Points, string Category, string BadgeIcon);
public record KidsQuizQuestionDto(Guid Id, string QuestionText, string OptionA, string OptionB, string OptionC, string OptionD, int CorrectOptionIndex, string Explanation, string Category);
// Queries
public record GetKidsStoriesQuery(string? AgeGroup = null) : IQuery<IReadOnlyList<KidsStoryDto>>;
public record GetKidsChallengesQuery : IQuery<IReadOnlyList<KidsChallengeDto>>;
public record GetKidsQuizQuestionsQuery(string? Category = null) : IQuery<IReadOnlyList<KidsQuizQuestionDto>>;

// Commands - Stories
public record CreateKidsStoryCommand(string Title, string AgeGroup, string Content, string MoralLesson, string CoverImageUrl = "", string AudioUrl = "") : ICommand<KidsStoryDto>;
public record DeleteKidsStoryCommand(Guid Id) : ICommand<bool>;

// Commands - Challenges
public record CreateKidsChallengeCommand(string Title, string Description, int Points, string Category, string BadgeIcon = "") : ICommand<KidsChallengeDto>;
public record DeleteKidsChallengeCommand(Guid Id) : ICommand<bool>;

// Commands - Quizzes
public record CreateKidsQuizQuestionCommand(string QuestionText, string OptionA, string OptionB, string OptionC, string OptionD, int CorrectOptionIndex, string Explanation, string Category = "General") : ICommand<KidsQuizQuestionDto>;
public record DeleteKidsQuizQuestionCommand(Guid Id) : ICommand<bool>;

