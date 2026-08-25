using MediatR;
using Microsoft.AspNetCore.Mvc;
using Questions.Application;

namespace Azkar.Api.Endpoints;

public static class QuestionsEndpoints
{
    public static IEndpointRouteBuilder MapQuestionsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/questions").WithTags("Questions");

        group.MapGet("/", async ([FromQuery] string? category, [FromQuery] string? search, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetQuestionsQuery(category, search), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetQuestions")
        .WithSummary("Get community Islamic Q&A questions");

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetQuestionDetailsQuery(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
        })
        .WithName("GetQuestionDetails")
        .WithSummary("Get question details with answers");

        group.MapPost("/", async ([FromBody] AskQuestionCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Created($"/api/questions/{result.Value.Id}", result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("AskQuestion")
        .WithSummary("Submit a new question");

        group.MapPost("/answers", async ([FromBody] AddAnswerCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("AddAnswer")
        .WithSummary("Add an answer to a question");

        return app;
    }
}
