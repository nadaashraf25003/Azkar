using BuildingBlocks.Domain;

namespace Tasbeeh.Domain.Entities;

public class TasbeehPreset : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string ArabicText { get; private set; } = string.Empty;
    public string Transliteration { get; private set; } = string.Empty;
    public string Benefit { get; private set; } = string.Empty;
    public int TargetCount { get; private set; } = 33;
    public bool IsCustom { get; private set; } = false;
    public string? DeviceIdentifier { get; private set; }

    private TasbeehPreset() { }

    public static TasbeehPreset Create(string name, string arabicText, string transliteration, string benefit, int targetCount, bool isCustom = false, string? deviceIdentifier = null)
    {
        return new TasbeehPreset
        {
            Name = name,
            ArabicText = arabicText,
            Transliteration = transliteration,
            Benefit = benefit,
            TargetCount = targetCount,
            IsCustom = isCustom,
            DeviceIdentifier = deviceIdentifier
        };
    }
}

public class TasbeehSession : Entity
{
    public string DeviceIdentifier { get; private set; } = string.Empty;
    public Guid? PresetId { get; private set; }
    public string ZikrName { get; private set; } = string.Empty;
    public int TotalCount { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private TasbeehSession() { }

    public static TasbeehSession Create(string deviceIdentifier, Guid? presetId, string zikrName, int totalCount)
    {
        return new TasbeehSession
        {
            DeviceIdentifier = deviceIdentifier,
            PresetId = presetId,
            ZikrName = zikrName,
            TotalCount = totalCount,
            CreatedAtUtc = DateTime.UtcNow
        };
    }
}
