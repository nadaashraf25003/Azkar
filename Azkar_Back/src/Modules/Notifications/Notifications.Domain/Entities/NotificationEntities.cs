using BuildingBlocks.Domain;

namespace Notifications.Domain.Entities;

public class PushSubscription : AuditableEntity
{
    public string DeviceIdentifier { get; private set; } = string.Empty;
    public string Endpoint { get; private set; } = string.Empty;
    public string P256dhKey { get; private set; } = string.Empty;
    public string AuthKey { get; private set; } = string.Empty;
    public bool MorningAdhkarEnabled { get; private set; } = true;
    public bool EveningAdhkarEnabled { get; private set; } = true;
    public bool PrayerRemindersEnabled { get; private set; } = true;
    public bool DailyQuoteEnabled { get; private set; } = true;

    private PushSubscription() { }

    public static PushSubscription Create(
        string deviceIdentifier,
        string endpoint,
        string p256dhKey,
        string authKey,
        bool morningAdhkar = true,
        bool eveningAdhkar = true,
        bool prayerReminders = true,
        bool dailyQuote = true)
    {
        return new PushSubscription
        {
            DeviceIdentifier = deviceIdentifier,
            Endpoint = endpoint,
            P256dhKey = p256dhKey,
            AuthKey = authKey,
            MorningAdhkarEnabled = morningAdhkar,
            EveningAdhkarEnabled = eveningAdhkar,
            PrayerRemindersEnabled = prayerReminders,
            DailyQuoteEnabled = dailyQuote
        };
    }
}
