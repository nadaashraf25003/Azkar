using Kids.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Endpoints;

public static class KidsEndpoints
{
    public static IEndpointRouteBuilder MapKidsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/kids").WithTags("Kids");

        group.MapGet("/stories", async ([FromQuery] string? ageGroup, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetKidsStoriesQuery(ageGroup), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetKidsStories")
        .WithSummary("Get stories for kids");

        group.MapGet("/challenges", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetKidsChallengesQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetKidsChallenges")
        .WithSummary("Get kids daily challenges");

        group.MapGet("/quizzes", async ([FromQuery] string? category, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetKidsQuizQuestionsQuery(category), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetKidsQuizzes")
        .WithSummary("Get kids quiz questions");

        group.MapGet("/progress", async ([FromQuery] string deviceId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetKidsProgressQuery(deviceId), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetKidsProgress")
        .WithSummary("Get kids points and progress");

        group.MapPost("/points", async ([FromBody] AddKidsPointsCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("AddKidsPoints")
        .WithSummary("Add points for completed kids activity");

        return app;
    }
}
