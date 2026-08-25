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
        var totalSurahs = await _context.Surahs.CountAsync(cancellationToken);
        var totalRecitations = await _context.Recitations.CountAsync(cancellationToken);
        var totalQuestions = await _context.Questions.CountAsync(cancellationToken);
        var totalReportsPending = await _context.ContentReports.CountAsync(r => !r.IsResolved, cancellationToken);

        var stats = new DashboardStatsDto(totalAdhkar, totalSurahs, totalRecitations, totalQuestions, totalReportsPending);
        return Result.Success(stats);
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
