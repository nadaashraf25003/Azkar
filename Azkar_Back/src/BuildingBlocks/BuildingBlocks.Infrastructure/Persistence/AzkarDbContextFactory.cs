using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BuildingBlocks.Infrastructure.Persistence;

public class AzkarDbContextFactory : IDesignTimeDbContextFactory<AzkarDbContext>
{
    public AzkarDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AzkarDbContext>();
        
        // MonsterASP connection string
        const string connectionString = "Server=db65209.databaseasp.net; Database=db65209; User Id=db65209; Password=8o-Xz#F5=T9t; Encrypt=False; MultipleActiveResultSets=True;";
        
        optionsBuilder.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.MigrationsAssembly(typeof(AzkarDbContext).Assembly.FullName);
        });

        return new AzkarDbContext(optionsBuilder.Options);
    }
}
