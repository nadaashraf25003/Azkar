using System.Reflection;
using BuildingBlocks.Application.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace BuildingBlocks.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddBuildingBlocksApplication(this IServiceCollection services, params Assembly[] moduleAssemblies)
    {
        var assemblies = new List<Assembly> { typeof(DependencyInjection).Assembly };
        if (moduleAssemblies != null && moduleAssemblies.Length != 0)
        {
            assemblies.AddRange(moduleAssemblies);
        }

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssemblies([.. assemblies]);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        });

        services.AddValidatorsFromAssemblies(assemblies);

        return services;
    }
}
