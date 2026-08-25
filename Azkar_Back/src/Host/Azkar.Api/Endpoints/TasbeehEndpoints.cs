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

        group.MapPost("/session", async ([FromBody] RecordSessionCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("RecordTasbeehSession")
        .WithSummary("Record a completed Tasbeeh counter session");

        group.MapGet("/stats", async ([FromQuery] string deviceId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetStatsQuery(deviceId), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetTasbeehStats")
        .WithSummary("Get user Tasbeeh counter statistics");

        return app;
    }
}
