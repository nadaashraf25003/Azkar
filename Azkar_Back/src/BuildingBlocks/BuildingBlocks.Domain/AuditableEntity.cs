namespace BuildingBlocks.Domain;

public abstract class AuditableEntity : AggregateRoot
{
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
    public bool IsDeleted { get; set; } = false;
}
