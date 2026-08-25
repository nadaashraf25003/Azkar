using MediatR;
using Microsoft.AspNetCore.Mvc;
using Notifications.Application;

namespace Azkar.Api.Endpoints;

public static class NotificationsEndpoints
{
    public static IEndpointRouteBuilder MapNotificationsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/notifications").WithTags("Notifications");

        group.MapPost("/subscribe", async ([FromBody] SubscribeToPushCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("SubscribeToPushNotifications")
        .WithSummary("Register Web Push notification subscription");

        group.MapPost("/unsubscribe", async ([FromBody] UnsubscribePushCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(new { unsubscribed = true }) : Results.BadRequest(result.Error);
        })
        .WithName("UnsubscribeFromPushNotifications")
        .WithSummary("Unsubscribe from push notifications");

        return app;
    }
}
