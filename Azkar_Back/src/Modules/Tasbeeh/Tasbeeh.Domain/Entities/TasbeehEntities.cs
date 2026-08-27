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


