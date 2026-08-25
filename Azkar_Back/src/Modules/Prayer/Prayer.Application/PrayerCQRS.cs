using BuildingBlocks.Application.CQRS;

namespace Prayer.Application;

public record PrayerTimesDto(string Date, string Fajr, string Sunrise, string Dhuhr, string Asr, string Maghrib, string Isha, string NextPrayer, string TimeRemaining);
public record QiblaDirectionDto(double Latitude, double Longitude, double QiblaAngleDegrees, double DistanceToKaabaKm);
public record PrayerSettingDto(string DeviceIdentifier, string CalculationMethod, string JuristicMethod, double Latitude, double Longitude, string CityName, string CountryName, int TimezoneOffsetMinutes);

// Queries
public record GetPrayerTimesQuery(double Latitude, double Longitude, string? CalculationMethod = "Egyptian", string? Date = null) : IQuery<PrayerTimesDto>;
public record GetQiblaDirectionQuery(double Latitude, double Longitude) : IQuery<QiblaDirectionDto>;
public record GetPrayerSettingsQuery(string DeviceIdentifier) : IQuery<PrayerSettingDto>;

// Commands
public record SavePrayerSettingsCommand(string DeviceIdentifier, string CalculationMethod, string JuristicMethod, double Latitude, double Longitude, string CityName, string CountryName, int TimezoneOffsetMinutes) : ICommand<PrayerSettingDto>;
