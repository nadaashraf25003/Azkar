using MediatR;
using Microsoft.AspNetCore.Mvc;
using Recitations.Application;

namespace Azkar.Api.Endpoints;

public static class RecitationsEndpoints
{
    public static IEndpointRouteBuilder MapRecitationsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/recitations").WithTags("Recitations");

        group.MapGet("/", async ([FromQuery] int? surahNumber, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetApprovedRecitationsQuery(surahNumber), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetRecitations")
        .WithSummary("Get community Quran recitations");

        group.MapPost("/", async ([FromBody] SubmitRecitationCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Created($"/api/recitations/{result.Value.Id}", result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("SubmitRecitation")
        .WithSummary("Submit a new recitation for moderation");

        group.MapPost("/{id:guid}/rate", async (Guid id, [FromBody] RateRecitationRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new RateRecitationCommand(id, request.DeviceIdentifier, request.Score), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("RateRecitation")
        .WithSummary("Rate a recitation (1-5 stars)");

        return app;
    }

    public record RateRecitationRequest(string DeviceIdentifier, int Score);
}
