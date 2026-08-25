using Microsoft.EntityFrameworkCore;
using Recitations.Domain.Entities;

namespace Recitations.Application.Common;

public interface IRecitationsDbContext
{
    DbSet<Recitation> Recitations { get; }
    DbSet<RecitationComment> RecitationComments { get; }
    DbSet<RecitationRating> RecitationRatings { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
