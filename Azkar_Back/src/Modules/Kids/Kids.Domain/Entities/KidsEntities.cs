using BuildingBlocks.Domain;

namespace Kids.Domain.Entities;

public class KidsStory : Entity
{
    public string Title { get; private set; } = string.Empty;
    public string AgeGroup { get; private set; } = "5-8"; // 4-7, 8-12
    public string Content { get; private set; } = string.Empty;
    public string MoralLesson { get; private set; } = string.Empty;
    public string CoverImageUrl { get; private set; } = string.Empty;
    public string AudioUrl { get; private set; } = string.Empty;

    private KidsStory() { }

    public static KidsStory Create(string title, string ageGroup, string content, string moralLesson, string coverImageUrl = "", string audioUrl = "")
    {
        return new KidsStory
        {
            Title = title,
            AgeGroup = ageGroup,
            Content = content,
            MoralLesson = moralLesson,
            CoverImageUrl = coverImageUrl,
            AudioUrl = audioUrl
        };
    }
}

public class KidsChallenge : Entity
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int Points { get; private set; } = 10;
    public string Category { get; private set; } = "Daily Akhlaq"; // Prayer, Fasting, Kindness, Akhlaq
    public string BadgeIcon { get; private set; } = string.Empty;

    private KidsChallenge() { }

    public static KidsChallenge Create(string title, string description, int points, string category, string badgeIcon = "")
    {
        return new KidsChallenge
        {
            Title = title,
            Description = description,
            Points = points,
            Category = category,
            BadgeIcon = badgeIcon
        };
    }
}

public class KidsQuizQuestion : Entity
{
    public string QuestionText { get; private set; } = string.Empty;
    public string OptionA { get; private set; } = string.Empty;
    public string OptionB { get; private set; } = string.Empty;
    public string OptionC { get; private set; } = string.Empty;
    public string OptionD { get; private set; } = string.Empty;
    public int CorrectOptionIndex { get; private set; } // 0, 1, 2, 3
    public string Explanation { get; private set; } = string.Empty;
    public string Category { get; private set; } = "General";

    private KidsQuizQuestion() { }

    public static KidsQuizQuestion Create(string questionText, string optionA, string optionB, string optionC, string optionD, int correctOptionIndex, string explanation, string category = "General")
    {
        return new KidsQuizQuestion
        {
            QuestionText = questionText,
            OptionA = optionA,
            OptionB = optionB,
            OptionC = optionC,
            OptionD = optionD,
            CorrectOptionIndex = correctOptionIndex,
            Explanation = explanation,
            Category = category
        };
    }
}


