using Microsoft.EntityFrameworkCore;
using Notifications.Domain.Entities;

namespace Notifications.Application.Common;

public interface INotificationsDbContext
{
    DbSet<PushSubscription> PushSubscriptions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
