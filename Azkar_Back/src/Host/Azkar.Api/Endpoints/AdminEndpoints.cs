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
