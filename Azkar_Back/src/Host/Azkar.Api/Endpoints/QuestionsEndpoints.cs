using MediatR;
using Microsoft.AspNetCore.Mvc;
using Questions.Application;

namespace Azkar.Api.Endpoints;

public static class QuestionsEndpoints
{
    public static IEndpointRouteBuilder MapQuestionsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/questions").WithTags("Questions");

        group.MapGet("/", async ([FromQuery] string? category, [FromQuery] string? search, [FromQuery] bool includePending, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetQuestionsQuery(category, search, includePending), ct);
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

        group.MapPut("/{id:guid}/approve", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new ApproveQuestionCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("ApproveQuestion")
        .WithSummary("Approve a pending question");

        group.MapPut("/{id:guid}/reject", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new RejectQuestionCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("RejectQuestion")
        .WithSummary("Reject a question");

        group.MapPost("/answers", async ([FromBody] AddAnswerCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("AddAnswer")
        .WithSummary("Add an answer to a question");

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteQuestionCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { success = true, id }) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteQuestion")
        .WithSummary("Delete a question and its answers from database (Admin)");

        group.MapDelete("/answers/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteAnswerCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { success = true, id }) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteAnswer")
        .WithSummary("Delete an answer from database (Admin)");

        return app;
    }
}
