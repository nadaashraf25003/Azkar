using BuildingBlocks.Domain;

namespace Administration.Domain.Entities;

public class ContentReport : AuditableEntity
{
    public string TargetType { get; private set; } = string.Empty; // Recitation, Comment, Question, Answer
    public Guid TargetId { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public string ReporterDeviceIdentifier { get; private set; } = string.Empty;
    public bool IsResolved { get; private set; }
    public string ResolutionNotes { get; private set; } = string.Empty;

    private ContentReport() { }

    public static ContentReport Create(string targetType, Guid targetId, string reason, string reporterDevice)
    {
        return new ContentReport
        {
            TargetType = targetType,
            TargetId = targetId,
            Reason = reason,
            ReporterDeviceIdentifier = reporterDevice,
            IsResolved = false
        };
    }

    public void Resolve(string notes)
    {
        IsResolved = true;
        ResolutionNotes = notes;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}

public class AuditLog : Entity
{
    public string Action { get; private set; } = string.Empty;
    public string EntityName { get; private set; } = string.Empty;
    public string EntityId { get; private set; } = string.Empty;
    public string Details { get; private set; } = string.Empty;
    public DateTime TimestampUtc { get; private set; } = DateTime.UtcNow;

    private AuditLog() { }

    public static AuditLog Create(string action, string entityName, string entityId, string details)
    {
        return new AuditLog
        {
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Details = details,
            TimestampUtc = DateTime.UtcNow
        };
    }
}
