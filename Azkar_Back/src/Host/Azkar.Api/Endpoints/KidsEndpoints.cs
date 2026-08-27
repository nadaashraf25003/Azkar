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

        // Stories POST & DELETE
        group.MapPost("/stories", async ([FromBody] CreateKidsStoryCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateKidsStory")
        .WithSummary("Add new story for kids");

        group.MapDelete("/stories/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteKidsStoryCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteKidsStory")
        .WithSummary("Delete kids story by ID");

        // Challenges POST & DELETE
        group.MapPost("/challenges", async ([FromBody] CreateKidsChallengeCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateKidsChallenge")
        .WithSummary("Add new challenge for kids");

        group.MapDelete("/challenges/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteKidsChallengeCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteKidsChallenge")
        .WithSummary("Delete kids challenge by ID");

        // Quizzes POST & DELETE
        group.MapPost("/quizzes", async ([FromBody] CreateKidsQuizQuestionCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateKidsQuizQuestion")
        .WithSummary("Add new quiz question for kids");

        group.MapDelete("/quizzes/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteKidsQuizQuestionCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteKidsQuizQuestion")
        .WithSummary("Delete kids quiz question by ID");

        return app;
    }
}
