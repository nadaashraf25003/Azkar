using Microsoft.EntityFrameworkCore;
using Administration.Domain.Entities;
using Adhkar.Domain.Entities;
using Recitations.Domain.Entities;
using Questions.Domain.Entities;

namespace Administration.Application.Common;

public interface IAdministrationDbContext
{
    DbSet<ContentReport> ContentReports { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<Zikr> Adhkar { get; }
    DbSet<Recitation> Recitations { get; }
    DbSet<Question> Questions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
