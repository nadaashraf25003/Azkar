using BuildingBlocks.Application.CQRS;

namespace Administration.Application;

public record ContentReportDto(Guid Id, string TargetType, Guid TargetId, string Reason, string ReporterDeviceIdentifier, bool IsResolved, string ResolutionNotes, DateTime CreatedAtUtc);
public record AuditLogDto(Guid Id, string Action, string EntityName, string EntityId, string Details, DateTime TimestampUtc);
public record DashboardStatsDto(int TotalAdhkar, int TotalRecitations, int TotalQuestions, int TotalReportsPending, int TotalUniqueDevices);

public record DeviceReportDto(
    string DeviceIdentifier,
    string DeviceName,
    string Platform,
    int TotalVisits,
    DateTime FirstSeenUtc,
    DateTime LastActiveUtc
);

public record DeviceReportSummaryDto(
    int TotalUniqueDevices,
    int TotalAppOpens,
    int ActiveToday,
    int ActiveThisWeek,
    Dictionary<string, int> DevicesByPlatform,
    IReadOnlyList<DeviceReportDto> RecentDevices
);

// Queries
public record GetPendingReportsQuery : IQuery<IReadOnlyList<ContentReportDto>>;
public record GetDashboardStatsQuery : IQuery<DashboardStatsDto>;
public record GetAuditLogsQuery(int Limit = 50) : IQuery<IReadOnlyList<AuditLogDto>>;
public record GetDeviceReportsQuery(string? Search = null) : IQuery<IReadOnlyList<DeviceReportDto>>;
public record GetDeviceReportSummaryQuery : IQuery<DeviceReportSummaryDto>;

// Commands
public record ReportContentCommand(string TargetType, Guid TargetId, string Reason, string ReporterDeviceIdentifier) : ICommand<ContentReportDto>;
public record ResolveContentReportCommand(Guid ReportId, string ResolutionNotes) : ICommand<bool>;
public record LogDeviceActivityCommand(string DeviceIdentifier, string DeviceName, string? Platform = null) : ICommand<bool>;
public record ClearOldAuditLogsCommand(int DaysOlderThan = 90) : ICommand<int>;

// Authentication DTOs & Commands
public record AdminAuthResponseDto(string Token, string Email, string Role, DateTime ExpiresAt);
public record AdminLoginCommand(string Email, string Password) : ICommand<AdminAuthResponseDto>;

