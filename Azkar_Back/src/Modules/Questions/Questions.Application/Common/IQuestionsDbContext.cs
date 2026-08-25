using Microsoft.EntityFrameworkCore;
using Questions.Domain.Entities;

namespace Questions.Application.Common;

public interface IQuestionsDbContext
{
    DbSet<Question> Questions { get; }
    DbSet<Answer> Answers { get; }
    DbSet<VoteRecord> VoteRecords { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
