using BuildingBlocks.Domain;

namespace Recitations.Domain.Entities;

public enum ModerationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public class Recitation : AuditableEntity
{
    public string Title { get; private set; } = string.Empty;
    public string ReciterName { get; private set; } = string.Empty;
    public string AudioUrl { get; private set; } = string.Empty;
    public int SurahNumber { get; private set; }
    public int FromAyah { get; private set; }
    public int ToAyah { get; private set; }
    public int DurationSeconds { get; private set; }
    public ModerationStatus Status { get; private set; } = ModerationStatus.Pending;
    public double AverageRating { get; private set; }
    public int RatingsCount { get; private set; }

    private readonly List<RecitationComment> _comments = [];
    public IReadOnlyCollection<RecitationComment> Comments => _comments.AsReadOnly();

    private readonly List<RecitationRating> _ratings = [];
    public IReadOnlyCollection<RecitationRating> Ratings => _ratings.AsReadOnly();

    private Recitation() { }

    public static Recitation Create(
        string title,
        string reciterName,
        string audioUrl,
        int surahNumber,
        int fromAyah,
        int toAyah,
        int durationSeconds)
    {
        return new Recitation
        {
            Title = title,
            ReciterName = reciterName,
            AudioUrl = audioUrl,
            SurahNumber = surahNumber,
            FromAyah = fromAyah,
            ToAyah = toAyah,
            DurationSeconds = durationSeconds,
            Status = ModerationStatus.Pending
        };
    }

    public void Approve() => Status = ModerationStatus.Approved;
    public void Reject() => Status = ModerationStatus.Rejected;

    public void AddRating(int score)
    {
        var totalScore = (AverageRating * RatingsCount) + score;
        RatingsCount++;
        AverageRating = Math.Round(totalScore / RatingsCount, 2);
    }
}

public class RecitationComment : AuditableEntity
{
    public Guid RecitationId { get; private set; }
    public string AuthorName { get; private set; } = "Anonymous";
    public string Content { get; private set; } = string.Empty;
    public Recitation? Recitation { get; private set; }

    private RecitationComment() { }

    public static RecitationComment Create(Guid recitationId, string authorName, string content)
    {
        return new RecitationComment
        {
            RecitationId = recitationId,
            AuthorName = string.IsNullOrWhiteSpace(authorName) ? "Anonymous" : authorName,
            Content = content
        };
    }
}

public class RecitationRating : Entity
{
    public Guid RecitationId { get; private set; }
    public string DeviceIdentifier { get; private set; } = string.Empty;
    public int Score { get; private set; }
    public DateTime RatedAtUtc { get; private set; } = DateTime.UtcNow;

    private RecitationRating() { }

    public static RecitationRating Create(Guid recitationId, string deviceIdentifier, int score)
    {
        return new RecitationRating
        {
            RecitationId = recitationId,
            DeviceIdentifier = deviceIdentifier,
            Score = Math.Clamp(score, 1, 5)
        };
    }
}
