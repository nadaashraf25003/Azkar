using BuildingBlocks.Application.CQRS;

namespace Notifications.Application;

public record PushSubscriptionDto(Guid Id, string DeviceIdentifier, string Endpoint, bool MorningAdhkarEnabled, bool EveningAdhkarEnabled, bool PrayerRemindersEnabled, bool DailyQuoteEnabled);

// Commands
public record SubscribeToPushCommand(string DeviceIdentifier, string Endpoint, string P256dhKey, string AuthKey, bool MorningAdhkar = true, bool EveningAdhkar = true, bool PrayerReminders = true, bool DailyQuote = true) : ICommand<PushSubscriptionDto>;
public record UnsubscribePushCommand(string DeviceIdentifier) : ICommand<bool>;
