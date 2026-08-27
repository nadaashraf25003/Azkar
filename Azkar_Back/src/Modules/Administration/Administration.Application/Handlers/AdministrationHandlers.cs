using Administration.Application.Common;
using Administration.Domain.Entities;
using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;

namespace Administration.Application.Handlers;

public class GetPendingReportsQueryHandler : IQueryHandler<GetPendingReportsQuery, IReadOnlyList<ContentReportDto>>
{
    private readonly IAdministrationDbContext _context;

    public GetPendingReportsQueryHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ContentReportDto>>> Handle(GetPendingReportsQuery request, CancellationToken cancellationToken)
    {
        var reports = await _context.ContentReports
            .AsNoTracking()
            .Where(r => !r.IsResolved)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new ContentReportDto(
                r.Id,
                r.TargetType,
                r.TargetId,
                r.Reason,
                r.ReporterDeviceIdentifier,
                r.IsResolved,
                r.ResolutionNotes,
                r.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ContentReportDto>>(reports);
    }
}

public class GetDashboardStatsQueryHandler : IQueryHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IAdministrationDbContext _context;

    public GetDashboardStatsQueryHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var totalAdhkar = await _context.Adhkar.CountAsync(cancellationToken);
        var totalRecitations = await _context.Recitations.CountAsync(cancellationToken);
        var totalQuestions = await _context.Questions.CountAsync(cancellationToken);
        var totalReportsPending = await _context.ContentReports.CountAsync(r => !r.IsResolved, cancellationToken);
        var totalUniqueDevices = await _context.AuditLogs
            .Where(l => l.Action == "DeviceOpen")
            .Select(l => l.EntityId)
            .Distinct()
            .CountAsync(cancellationToken);

        var stats = new DashboardStatsDto(totalAdhkar, totalRecitations, totalQuestions, totalReportsPending, totalUniqueDevices);
        return Result.Success(stats);
    }
}

public class GetDeviceReportsQueryHandler : IQueryHandler<GetDeviceReportsQuery, IReadOnlyList<DeviceReportDto>>
{
    private readonly IAdministrationDbContext _context;

    public GetDeviceReportsQueryHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DeviceReportDto>>> Handle(GetDeviceReportsQuery request, CancellationToken cancellationToken)
    {
        var logs = await _context.AuditLogs
            .AsNoTracking()
            .Where(l => l.Action == "DeviceOpen")
            .OrderByDescending(l => l.TimestampUtc)
            .ToListAsync(cancellationToken);

        var grouped = logs
            .GroupBy(l => l.EntityId)
            .Select(g =>
            {
                var latest = g.OrderByDescending(x => x.TimestampUtc).First();
                var earliest = g.OrderBy(x => x.TimestampUtc).First();

                var details = latest.Details ?? string.Empty;
                var parts = details.Split('|');
                var deviceName = parts.Length > 0 && !string.IsNullOrWhiteSpace(parts[0]) ? parts[0] : "Browser / Web";
                var platform = parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]) ? parts[1] : DetectPlatform(deviceName);

                return new DeviceReportDto(
                    DeviceIdentifier: g.Key,
                    DeviceName: deviceName,
                    Platform: platform,
                    TotalVisits: g.Count(),
                    FirstSeenUtc: earliest.TimestampUtc,
                    LastActiveUtc: latest.TimestampUtc
                );
            })
            .OrderByDescending(d => d.LastActiveUtc)
            .ToList();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            grouped = grouped
                .Where(d => d.DeviceIdentifier.ToLower().Contains(search) ||
                            d.DeviceName.ToLower().Contains(search) ||
                            d.Platform.ToLower().Contains(search))
                .ToList();
        }

        return Result.Success<IReadOnlyList<DeviceReportDto>>(grouped);
    }

    private static string DetectPlatform(string userAgentOrModel)
    {
        var str = userAgentOrModel.ToLower();
        if (str.Contains("android")) return "Android";
        if (str.Contains("iphone") || str.Contains("ipad") || str.Contains("ios")) return "iOS";
        if (str.Contains("windows")) return "Windows";
        if (str.Contains("mac") || str.Contains("macos")) return "macOS";
        if (str.Contains("linux")) return "Linux";
        return "Web";
    }
}

public class GetDeviceReportSummaryQueryHandler : IQueryHandler<GetDeviceReportSummaryQuery, DeviceReportSummaryDto>
{
    private readonly IAdministrationDbContext _context;

    public GetDeviceReportSummaryQueryHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeviceReportSummaryDto>> Handle(GetDeviceReportSummaryQuery request, CancellationToken cancellationToken)
    {
        var logs = await _context.AuditLogs
            .AsNoTracking()
            .Where(l => l.Action == "DeviceOpen")
            .OrderByDescending(l => l.TimestampUtc)
            .ToListAsync(cancellationToken);

        var totalAppOpens = logs.Count;
        var today = DateTime.UtcNow.Date;
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

        var grouped = logs
            .GroupBy(l => l.EntityId)
            .Select(g =>
            {
                var latest = g.OrderByDescending(x => x.TimestampUtc).First();
                var earliest = g.OrderBy(x => x.TimestampUtc).First();

                var details = latest.Details ?? string.Empty;
                var parts = details.Split('|');
                var deviceName = parts.Length > 0 && !string.IsNullOrWhiteSpace(parts[0]) ? parts[0] : "Browser / Web";
                var platform = parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]) ? parts[1] : DetectPlatform(deviceName);

                return new DeviceReportDto(
                    DeviceIdentifier: g.Key,
                    DeviceName: deviceName,
                    Platform: platform,
                    TotalVisits: g.Count(),
                    FirstSeenUtc: earliest.TimestampUtc,
                    LastActiveUtc: latest.TimestampUtc
                );
            })
            .OrderByDescending(d => d.LastActiveUtc)
            .ToList();

        var totalUniqueDevices = grouped.Count;
        var activeToday = grouped.Count(d => d.LastActiveUtc >= today);
        var activeThisWeek = grouped.Count(d => d.LastActiveUtc >= sevenDaysAgo);

        var platformCounts = new Dictionary<string, int>();
        foreach (var d in grouped)
        {
            var p = string.IsNullOrWhiteSpace(d.Platform) ? "Web" : d.Platform;
            platformCounts[p] = platformCounts.GetValueOrDefault(p, 0) + 1;
        }

        var recent = grouped.Take(10).ToList();

        var summary = new DeviceReportSummaryDto(
            totalUniqueDevices,
            totalAppOpens,
            activeToday,
            activeThisWeek,
            platformCounts,
            recent
        );

        return Result.Success(summary);
    }

    private static string DetectPlatform(string userAgentOrModel)
    {
        var str = userAgentOrModel.ToLower();
        if (str.Contains("android")) return "Android";
        if (str.Contains("iphone") || str.Contains("ipad") || str.Contains("ios")) return "iOS";
        if (str.Contains("windows")) return "Windows";
        if (str.Contains("mac") || str.Contains("macos")) return "macOS";
        if (str.Contains("linux")) return "Linux";
        return "Web";
    }
}

public class LogDeviceActivityCommandHandler : ICommandHandler<LogDeviceActivityCommand, bool>
{
    private readonly IAdministrationDbContext _context;

    public LogDeviceActivityCommandHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(LogDeviceActivityCommand request, CancellationToken cancellationToken)
    {
        var details = string.IsNullOrEmpty(request.Platform)
            ? request.DeviceName
            : $"{request.DeviceName}|{request.Platform}";

        var log = AuditLog.Create("DeviceOpen", "Device", request.DeviceIdentifier, details);
        await _context.AuditLogs.AddAsync(log, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

public class ReportContentCommandHandler : ICommandHandler<ReportContentCommand, ContentReportDto>
{
    private readonly IAdministrationDbContext _context;

    public ReportContentCommandHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ContentReportDto>> Handle(ReportContentCommand request, CancellationToken cancellationToken)
    {
        var report = ContentReport.Create(request.TargetType, request.TargetId, request.Reason, request.ReporterDeviceIdentifier);
        await _context.ContentReports.AddAsync(report, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new ContentReportDto(
            report.Id,
            report.TargetType,
            report.TargetId,
            report.Reason,
            report.ReporterDeviceIdentifier,
            report.IsResolved,
            report.ResolutionNotes,
            report.CreatedAtUtc
        );

        return Result.Success(dto);
    }
}

public class ResolveContentReportCommandHandler : ICommandHandler<ResolveContentReportCommand, bool>
{
    private readonly IAdministrationDbContext _context;

    public ResolveContentReportCommandHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(ResolveContentReportCommand request, CancellationToken cancellationToken)
    {
        var report = await _context.ContentReports.FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken);
        if (report == null)
        {
            return Result.Failure<bool>(Error.NotFound("ContentReport", request.ReportId));
        }

        report.Resolve(request.ResolutionNotes);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

public class ClearOldAuditLogsCommandHandler : ICommandHandler<ClearOldAuditLogsCommand, int>
{
    private readonly IAdministrationDbContext _context;

    public ClearOldAuditLogsCommandHandler(IAdministrationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<int>> Handle(ClearOldAuditLogsCommand request, CancellationToken cancellationToken)
    {
        var threshold = DateTime.UtcNow.AddDays(-request.DaysOlderThan);
        var oldLogs = await _context.AuditLogs
            .Where(l => l.TimestampUtc < threshold)
            .ToListAsync(cancellationToken);

        if (oldLogs.Count > 0)
        {
            _context.AuditLogs.RemoveRange(oldLogs);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Success(oldLogs.Count);
    }
}

