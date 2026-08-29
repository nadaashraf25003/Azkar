using Administration.Application;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/admin").WithTags("Administration");

        // Public Admin Login Endpoint
        group.MapPost("/login", async ([FromBody] AdminLoginCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess 
                ? Results.Ok(result.Value) 
                : Results.Json(new { error = result.Error.Message, code = result.Error.Code }, statusCode: StatusCodes.Status401Unauthorized);
        })
        .AllowAnonymous()
        .WithName("AdminLogin")
        .WithSummary("Admin login with email and password to receive JWT bearer token");

        // Protected Admin Statistics & Analytics
        group.MapGet("/stats", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetDashboardStatsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithName("GetAdminDashboardStats")
        .WithSummary("Get general administrative statistics (Admin Only)");

        // Protected Device Reports & Analytics
        group.MapGet("/devices", async ([FromQuery] string? search, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetDeviceReportsQuery(search), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithName("GetAdminDeviceReports")
        .WithSummary("Get list of all devices that entered the app with visit statistics (Admin Only)");

        group.MapGet("/devices/summary", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetDeviceReportSummaryQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithName("GetAdminDeviceReportSummary")
        .WithSummary("Get aggregated device analytics and summary (Admin Only)");

        // Public Device App Entry Activity Log
        group.MapPost("/devices/log", async ([FromBody] LogDeviceActivityCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .AllowAnonymous()
        .WithName("LogDeviceActivity")
        .WithSummary("Log device app entry activity");

        // Protected Device Log Management
        group.MapPost("/devices/clear", async ([FromBody] ClearOldAuditLogsCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(new { deletedCount = result.Value }) : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithName("ClearOldDeviceLogs")
        .WithSummary("Clear device logs older than specified days (Admin Only)");

        // Backward-compatible device ping on POST /admin/stats
        group.MapPost("/stats", async ([FromBody] LogDeviceActivityCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .AllowAnonymous()
        .WithName("LogDeviceOpenStats")
        .WithSummary("Log device stats ping on app launch");

        // Protected Pending Reports
        group.MapGet("/reports", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPendingReportsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithName("GetPendingContentReports")
        .WithSummary("Get list of unresolved user reports (Admin Only)");

        // Protected Report Resolution
        group.MapPut("/reports/{id:guid}/resolve", async (Guid id, [FromBody] ResolveReportRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new ResolveContentReportCommand(id, request.ResolutionNotes), ct);
            return result.IsSuccess ? Results.Ok(new { success = true, id }) : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithName("ResolveContentReport")
        .WithSummary("Resolve a user content violation report (Admin Only)");

        // Public User Violation Report Submission
        group.MapPost("/reports", async ([FromBody] ReportContentCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .AllowAnonymous()
        .WithName("ReportContent")
        .WithSummary("Submit a content violation report");

        return app;
    }
}

public record ResolveReportRequest(string ResolutionNotes);

