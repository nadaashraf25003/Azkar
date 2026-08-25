using Microsoft.EntityFrameworkCore;
using Content.Domain.Entities;

namespace Content.Application.Common;

public interface IContentDbContext
{
    DbSet<AsmaaAllah> AsmaaAllah { get; }
    DbSet<SeerahEvent> SeerahEvents { get; }
    DbSet<ReligiousInfo> ReligiousInfos { get; }
    DbSet<DailyMessage> DailyMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
