using Favorites.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Endpoints;

public static class FavoritesEndpoints
{
    public static IEndpointRouteBuilder MapFavoritesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/favorites").WithTags("Favorites");

        group.MapGet("/", async ([FromQuery] string deviceId, [FromQuery] string? itemType, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetFavoritesByDeviceQuery(deviceId, itemType), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetFavorites")
        .WithSummary("Get list of user favorites");

        group.MapPost("/toggle", async ([FromBody] ToggleFavoriteCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(new { isFavorited = result.Value }) : Results.BadRequest(result.Error);
        })
        .WithName("ToggleFavorite")
        .WithSummary("Toggle bookmark/favorite state for any item");

        return app;
    }
}
