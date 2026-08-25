using Microsoft.EntityFrameworkCore;
using Quran.Domain.Entities;

namespace Quran.Application.Common;

public interface IQuranDbContext
{
    DbSet<Surah> Surahs { get; }
    DbSet<Ayah> Ayat { get; }
    DbSet<Tafsir> Tafsirs { get; }
    DbSet<Reciter> Reciters { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
