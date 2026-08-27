using Content.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Endpoints;

public static class ContentEndpoints
{
    public static IEndpointRouteBuilder MapContentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/content").WithTags("Content");

        group.MapGet("/asmaa-allah", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAsmaaAllahQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAsmaaAllah")
        .WithSummary("Get 99 Names of Allah");

        group.MapGet("/seerah", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetSeerahEventsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetSeerahEvents")
        .WithSummary("Get Seerah timeline events");

        group.MapPost("/seerah", async ([FromBody] CreateSeerahEventCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateSeerahEvent")
        .WithSummary("Add new Seerah timeline event");

        group.MapDelete("/seerah/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteSeerahEventCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteSeerahEvent")
        .WithSummary("Delete Seerah timeline event by ID");

        group.MapGet("/religious-info", async ([FromQuery] string? category, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetReligiousInfoListQuery(category), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetReligiousInfo")
        .WithSummary("Get Islamic articles and facts");

        group.MapPost("/religious-info", async ([FromBody] CreateReligiousInfoCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateReligiousInfo")
        .WithSummary("Add new religious information article");

        group.MapDelete("/religious-info/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteReligiousInfoCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteReligiousInfo")
        .WithSummary("Delete religious information article by ID");

        group.MapGet("/daily-message", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetTodayMessageQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetDailyMessage")
        .WithSummary("Get today's inspirational message");

        group.MapGet("/messages", async ([FromQuery] string? category, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetMessagesQuery(category), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetMessages")
        .WithSummary("Get all seeded messages");

        group.MapPost("/messages", async ([FromBody] CreateMessageCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateMessage")
        .WithSummary("Add new message");

        group.MapDelete("/messages/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteMessageCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteMessage")
        .WithSummary("Delete message by ID");

        return app;
    }
}
