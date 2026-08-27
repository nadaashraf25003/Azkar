using MediatR;
using Microsoft.AspNetCore.Mvc;
using Recitations.Application;

namespace Azkar.Api.Endpoints;

public static class RecitationsEndpoints
{
    public static IEndpointRouteBuilder MapRecitationsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/recitations").WithTags("Recitations");

        group.MapGet("/", async ([FromQuery] int? surahNumber, [FromQuery] bool includePending, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetApprovedRecitationsQuery(surahNumber, includePending), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetRecitations")
        .WithSummary("Get community Quran recitations");

        group.MapPost("/", async ([FromBody] SubmitRecitationCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Created($"/recitations/{result.Value.Id}", result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("SubmitRecitation")
        .WithSummary("Submit a new recitation for moderation");

        group.MapPut("/{id:guid}/approve", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new ApproveRecitationCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { success = true, id }) : Results.BadRequest(result.Error);
        })
        .WithName("ApproveRecitation")
        .WithSummary("Approve a recitation (Admin)");

        group.MapPut("/{id:guid}/reject", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new RejectRecitationCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { success = true, id }) : Results.BadRequest(result.Error);
        })
        .WithName("RejectRecitation")
        .WithSummary("Reject a recitation (Admin)");

        group.MapPost("/{id:guid}/comments", async (Guid id, [FromBody] AddCommentRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new AddRecitationCommentCommand(id, request.AuthorName, request.Content), ct);
            return result.IsSuccess ? Results.Created($"/recitations/{id}/comments/{result.Value.Id}", result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("AddRecitationComment")
        .WithSummary("Add a comment or feedback on a recitation");

        group.MapPost("/{id:guid}/rate", async (Guid id, [FromBody] RateRecitationRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new RateRecitationCommand(id, request.DeviceIdentifier, request.Score), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("RateRecitation")
        .WithSummary("Rate a recitation (1-5 stars)");

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteRecitationCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { success = true, id }) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteRecitation")
        .WithSummary("Delete a recitation and its comments/ratings permanently (Admin)");

        group.MapDelete("/comments/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteRecitationCommentCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { success = true, id }) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteRecitationComment")
        .WithSummary("Delete a recitation comment permanently (Admin)");

        return app;
    }

    public record AddCommentRequest(string AuthorName, string Content);
    public record RateRecitationRequest(string DeviceIdentifier, int Score);
}
