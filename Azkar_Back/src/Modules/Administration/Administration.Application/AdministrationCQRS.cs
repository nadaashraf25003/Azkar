using BuildingBlocks.Application.CQRS;

namespace Administration.Application;

public record ContentReportDto(Guid Id, string TargetType, Guid TargetId, string Reason, string ReporterDeviceIdentifier, bool IsResolved, string ResolutionNotes, DateTime CreatedAtUtc);
public record AuditLogDto(Guid Id, string Action, string EntityName, string EntityId, string Details, DateTime TimestampUtc);
public record DashboardStatsDto(int TotalAdhkar, int TotalSurahs, int TotalRecitations, int TotalQuestions, int TotalReportsPending);

// Queries
public record GetPendingReportsQuery : IQuery<IReadOnlyList<ContentReportDto>>;
public record GetDashboardStatsQuery : IQuery<DashboardStatsDto>;
public record GetAuditLogsQuery(int Limit = 50) : IQuery<IReadOnlyList<AuditLogDto>>;

// Commands
public record ReportContentCommand(string TargetType, Guid TargetId, string Reason, string ReporterDeviceIdentifier) : ICommand<ContentReportDto>;
public record ResolveContentReportCommand(Guid ReportId, string ResolutionNotes) : ICommand<bool>;
