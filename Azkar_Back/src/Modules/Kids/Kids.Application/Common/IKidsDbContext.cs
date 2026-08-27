using Microsoft.EntityFrameworkCore;
using Kids.Domain.Entities;

namespace Kids.Application.Common;

public interface IKidsDbContext
{
    DbSet<KidsStory> KidsStories { get; }
    DbSet<KidsChallenge> KidsChallenges { get; }
    DbSet<KidsQuizQuestion> KidsQuizQuestions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
