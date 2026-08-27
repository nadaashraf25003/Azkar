using Administration.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/admin").WithTags("Administration");

        group.MapGet("/stats", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetDashboardStatsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAdminDashboardStats")
        .WithSummary("Get general administrative statistics");

        // Device Reports & Analytics
        group.MapGet("/devices", async ([FromQuery] string? search, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetDeviceReportsQuery(search), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAdminDeviceReports")
        .WithSummary("Get list of all devices that entered the app with visit statistics");

        group.MapGet("/devices/summary", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetDeviceReportSummaryQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAdminDeviceReportSummary")
        .WithSummary("Get aggregated device analytics and summary");

        group.MapPost("/devices/log", async ([FromBody] LogDeviceActivityCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("LogDeviceActivity")
        .WithSummary("Log device app entry activity");

        group.MapPost("/devices/clear", async ([FromBody] ClearOldAuditLogsCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(new { deletedCount = result.Value }) : Results.BadRequest(result.Error);
        })
        .WithName("ClearOldDeviceLogs")
        .WithSummary("Clear device logs older than specified days");

        // Backward-compatible device ping on POST /admin/stats
        group.MapPost("/stats", async ([FromBody] LogDeviceActivityCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("LogDeviceOpenStats")
        .WithSummary("Log device stats ping on app launch");

        group.MapGet("/reports", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPendingReportsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetPendingContentReports")
        .WithSummary("Get list of unresolved user reports");

        group.MapPost("/reports", async ([FromBody] ReportContentCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("ReportContent")
        .WithSummary("Submit a content violation report");

        return app;
    }
}
