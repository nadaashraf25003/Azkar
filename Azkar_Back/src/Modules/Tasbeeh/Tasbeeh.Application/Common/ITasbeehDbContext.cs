using Microsoft.EntityFrameworkCore;
using Tasbeeh.Domain.Entities;

namespace Tasbeeh.Application.Common;

public interface ITasbeehDbContext
{
    DbSet<TasbeehPreset> TasbeehPresets { get; }
    DbSet<TasbeehSession> TasbeehSessions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
