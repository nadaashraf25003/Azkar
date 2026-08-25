using MediatR;
using Microsoft.AspNetCore.Mvc;
using Prayer.Application;

namespace Azkar.Api.Endpoints;

public static class PrayerEndpoints
{
    public static IEndpointRouteBuilder MapPrayerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/prayer").WithTags("Prayer");

        group.MapGet("/times", async ([FromQuery] double lat, [FromQuery] double lng, [FromQuery] string? method, [FromQuery] string? date, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPrayerTimesQuery(lat, lng, method, date), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetPrayerTimes")
        .WithSummary("Calculate prayer times based on location");

        group.MapGet("/qibla", async ([FromQuery] double lat, [FromQuery] double lng, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetQiblaDirectionQuery(lat, lng), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetQiblaDirection")
        .WithSummary("Get Qibla compass angle and distance to Kaaba");

        group.MapPost("/settings", async ([FromBody] SavePrayerSettingsCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("SavePrayerSettings")
        .WithSummary("Save user prayer calculation preferences");

        return app;
    }
}
