using Adhkar.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Adhkar.Application.Common;

public interface IAdhkarDbContext
{
    DbSet<ZikrCategory> ZikrCategories { get; }
    DbSet<Zikr> Adhkar { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
