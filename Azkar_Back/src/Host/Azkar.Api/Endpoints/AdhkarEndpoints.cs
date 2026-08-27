using Adhkar.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Administration.Domain.Entities;
using BuildingBlocks.Infrastructure.Persistence;

namespace Azkar.Api.Endpoints;

public static class AdhkarEndpoints
{
    public static IEndpointRouteBuilder MapAdhkarEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/adhkar").WithTags("Adhkar");

        group.MapGet("/", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAllAdhkarQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAllAdhkar")
        .WithSummary("Get all Adhkar");

        group.MapGet("/categories", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetCategoriesQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAdhkarCategories")
        .WithSummary("Get all Zikr categories");

        group.MapGet("/by-category/{categoryId:guid}", async (Guid categoryId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAdhkarByCategoryQuery(categoryId), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAdhkarByCategory")
        .WithSummary("Get Adhkar list belonging to a specific category");

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetZikrByIdQuery(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
        })
        .WithName("GetZikrById")
        .WithSummary("Get details of a specific Zikr");

        group.MapPost("/", async ([FromBody] CreateZikrCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("CreateZikr")
        .WithSummary("Add a new Zikr");

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteZikrCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("DeleteZikr")
        .WithSummary("Delete a Zikr by ID");




        group.MapPost("/device-open", async ([FromBody] DeviceOpenDto request, AzkarDbContext dbContext, CancellationToken ct) =>
        {
            var auditLog = AuditLog.Create("DeviceOpen", "Device", request.DeviceIdentifier, request.DeviceName);
            await dbContext.AuditLogs.AddAsync(auditLog, ct);
            await dbContext.SaveChangesAsync(ct);
            return Results.Ok();
        })
        .WithName("LogDeviceOpen")
        .WithSummary("Log device opening the application");

        return app;
    }
}

public class DeviceOpenDto
{
    public string DeviceIdentifier { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
}

