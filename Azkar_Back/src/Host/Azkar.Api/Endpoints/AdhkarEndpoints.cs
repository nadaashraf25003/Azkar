using Adhkar.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Endpoints;

public static class AdhkarEndpoints
{
    public static IEndpointRouteBuilder MapAdhkarEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/adhkar").WithTags("Adhkar");

        group.MapGet("/categories", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetCategoriesQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAdhkarCategories")
        .WithSummary("Get all Zikr categories");

        group.MapGet("/by-category/{categoryId:guid}", async (Guid categoryId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAdhkarByCategoryQuery(categoryId), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAdhkarByCategory")
        .WithSummary("Get Adhkar list belonging to a specific category");

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetZikrByIdQuery(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
        })
        .WithName("GetZikrById")
        .WithSummary("Get details of a specific Zikr");

        group.MapGet("/progress/today", async ([FromQuery] string deviceId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetTodayProgressQuery(deviceId), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetTodayProgress")
        .WithSummary("Get user daily progress for Adhkar by device ID");

        group.MapPost("/progress", async ([FromBody] UpdateDailyProgressCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("UpdateDailyProgress")
        .WithSummary("Update daily completion progress for a Zikr");

        return app;
    }
}
