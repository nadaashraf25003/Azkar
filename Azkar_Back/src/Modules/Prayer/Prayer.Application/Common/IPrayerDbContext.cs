using Microsoft.EntityFrameworkCore;
using Prayer.Domain.Entities;

namespace Prayer.Application.Common;

public interface IPrayerDbContext
{
    DbSet<PrayerTimeSetting> PrayerSettings { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
