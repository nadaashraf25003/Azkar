using Content.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Endpoints;

public static class ContentEndpoints
{
    public static IEndpointRouteBuilder MapContentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/content").WithTags("Content");

        group.MapGet("/asmaa-allah", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAsmaaAllahQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAsmaaAllah")
        .WithSummary("Get 99 Names of Allah");

        group.MapGet("/seerah", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetSeerahEventsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetSeerahEvents")
        .WithSummary("Get Seerah timeline events");

        group.MapGet("/religious-info", async ([FromQuery] string? category, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetReligiousInfoListQuery(category), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetReligiousInfo")
        .WithSummary("Get Islamic articles and facts");

        group.MapGet("/daily-message", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetTodayMessageQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetDailyMessage")
        .WithSummary("Get today's inspirational message");

        return app;
    }
}
