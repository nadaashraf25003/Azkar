using Administration.Application.Common;
using Administration.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Administration.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAdministrationInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        return services;
    }
}
