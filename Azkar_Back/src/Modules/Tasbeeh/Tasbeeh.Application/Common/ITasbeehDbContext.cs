using Microsoft.EntityFrameworkCore;
using Tasbeeh.Domain.Entities;

namespace Tasbeeh.Application.Common;

public interface ITasbeehDbContext
{
    DbSet<TasbeehPreset> TasbeehPresets { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
