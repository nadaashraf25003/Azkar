using Microsoft.EntityFrameworkCore;
using Favorites.Domain.Entities;

namespace Favorites.Application.Common;

public interface IFavoritesDbContext
{
    DbSet<Favorite> Favorites { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
