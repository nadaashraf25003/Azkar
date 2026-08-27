using BuildingBlocks.Domain;

namespace Questions.Domain.Entities;

public class Question : AuditableEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public string Category { get; private set; } = "General"; // Fiqh, Aqeedah, Seerah, Quran, General
    public string AskerName { get; private set; } = "Anonymous";
    public int Upvotes { get; private set; }
    public int Downvotes { get; private set; }
    public bool IsAnswered { get; private set; }
    public bool IsApproved { get; private set; }

    private readonly List<Answer> _answers = [];
    public IReadOnlyCollection<Answer> Answers => _answers.AsReadOnly();

    private Question() { }

    public static Question Create(string title, string content, string category, string askerName, bool isApproved = false)
    {
        return new Question
        {
            Title = title,
            Content = content,
            Category = string.IsNullOrWhiteSpace(category) ? "General" : category,
            AskerName = string.IsNullOrWhiteSpace(askerName) ? "Anonymous" : askerName,
            IsApproved = isApproved
        };
    }

    public void Vote(bool isUpvote)
    {
        if (isUpvote) Upvotes++;
        else Downvotes++;
    }

    public void MarkAnswered() => IsAnswered = true;
    public void UpdateIsAnswered(bool isAnswered) => IsAnswered = isAnswered;
    public void Approve() => IsApproved = true;
    public void Reject() => IsApproved = false;
}

public class Answer : AuditableEntity
{
    public Guid QuestionId { get; private set; }
    public string AuthorName { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public string ReferenceSource { get; private set; } = string.Empty;
    public bool IsVerifiedScholar { get; private set; }
    public int Upvotes { get; private set; }
    public int Downvotes { get; private set; }

    public Question? Question { get; private set; }

    private Answer() { }

    public static Answer Create(Guid questionId, string authorName, string content, string referenceSource = "", bool isVerifiedScholar = false)
    {
        return new Answer
        {
            QuestionId = questionId,
            AuthorName = string.IsNullOrWhiteSpace(authorName) ? "Community Member" : authorName,
            Content = content,
            ReferenceSource = referenceSource,
            IsVerifiedScholar = isVerifiedScholar
        };
    }

    public void Vote(bool isUpvote)
    {
        if (isUpvote) Upvotes++;
        else Downvotes++;
    }
}

public class VoteRecord : Entity
{
    public string TargetType { get; private set; } = "Question"; // Question or Answer
    public Guid TargetId { get; private set; }
    public string DeviceIdentifier { get; private set; } = string.Empty;
    public bool IsUpvote { get; private set; }
    public DateTime VotedAtUtc { get; private set; } = DateTime.UtcNow;

    private VoteRecord() { }

    public static VoteRecord Create(string targetType, Guid targetId, string deviceIdentifier, bool isUpvote)
    {
        return new VoteRecord
        {
            TargetType = targetType,
            TargetId = targetId,
            DeviceIdentifier = deviceIdentifier,
            IsUpvote = isUpvote,
            VotedAtUtc = DateTime.UtcNow
        };
    }
}
