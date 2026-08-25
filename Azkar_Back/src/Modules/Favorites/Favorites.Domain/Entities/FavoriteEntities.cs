using BuildingBlocks.Domain;

namespace Favorites.Domain.Entities;

public class Favorite : AuditableEntity
{
    public string DeviceIdentifier { get; private set; } = string.Empty;
    public string ItemType { get; private set; } = string.Empty; // Zikr, Ayah, Name, Story, Question
    public string ItemId { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Subtitle { get; private set; } = string.Empty;
    public string ExtraDataJson { get; private set; } = string.Empty;

    private Favorite() { }

    public static Favorite Create(string deviceIdentifier, string itemType, string itemId, string title, string subtitle = "", string extraDataJson = "{}")
    {
        return new Favorite
        {
            DeviceIdentifier = deviceIdentifier,
            ItemType = itemType,
            ItemId = itemId,
            Title = title,
            Subtitle = subtitle,
            ExtraDataJson = extraDataJson
        };
    }
}
