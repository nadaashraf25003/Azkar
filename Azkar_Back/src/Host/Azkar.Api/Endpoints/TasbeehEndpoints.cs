using MediatR;
using Microsoft.AspNetCore.Mvc;
using Tasbeeh.Application;

namespace Azkar.Api.Endpoints;

public static class TasbeehEndpoints
{
    public static IEndpointRouteBuilder MapTasbeehEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/tasbeeh").WithTags("Tasbeeh");

        group.MapGet("/presets", async ([FromQuery] string? deviceId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPresetsQuery(deviceId), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetTasbeehPresets")
        .WithSummary("Get Tasbeeh presets");

        group.MapPost("/presets", async ([FromBody] CreateTasbeehPresetCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateTasbeehPreset")
        .WithSummary("Create Tasbeeh preset");

        group.MapDelete("/presets/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteTasbeehPresetCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteTasbeehPreset")
        .WithSummary("Delete Tasbeeh preset");

        return app;
    }
}
