using Adhkar.Application.Common;
using Administration.Application.Common;
using BuildingBlocks.Infrastructure.Persistence;
using BuildingBlocks.Infrastructure.Persistence.Interceptors;
using BuildingBlocks.Infrastructure.Persistence.Repositories;
using Content.Application.Common;
using Favorites.Application.Common;
using Kids.Application.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Notifications.Application.Common;
using Prayer.Application.Common;
using Questions.Application.Common;
using Quran.Application.Common;
using Recitations.Application.Common;
using Tasbeeh.Application.Common;

namespace BuildingBlocks.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddBuildingBlocksInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddSingleton<AuditableEntityInterceptor>();

        services.AddDbContext<AzkarDbContext>((sp, options) =>
        {
            var auditableInterceptor = sp.GetRequiredService<AuditableEntityInterceptor>();
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(AzkarDbContext).Assembly.FullName);
                sqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
            })
            .AddInterceptors(auditableInterceptor);
        });

        // Register Module DbContext Interfaces to resolved AzkarDbContext
        services.AddScoped<IAdhkarDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IQuranDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IRecitationsDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<ITasbeehDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IQuestionsDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IContentDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IKidsDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IPrayerDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IFavoritesDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<INotificationsDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());
        services.AddScoped<IAdministrationDbContext>(sp => sp.GetRequiredService<AzkarDbContext>());

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        return services;
    }
}
