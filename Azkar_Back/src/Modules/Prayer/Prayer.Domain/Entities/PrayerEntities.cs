using BuildingBlocks.Domain;

namespace Prayer.Domain.Entities;

public class PrayerTimeSetting : Entity
{
    public string DeviceIdentifier { get; private set; } = string.Empty;
    public string CalculationMethod { get; private set; } = "Egyptian"; // Egyptian, MWL, ISNA, UmmAlQura, Karachi
    public string JuristicMethod { get; private set; } = "Shafii"; // Shafii / Hanafi
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public string CityName { get; private set; } = string.Empty;
    public string CountryName { get; private set; } = string.Empty;
    public int TimezoneOffsetMinutes { get; private set; }

    private PrayerTimeSetting() { }

    public static PrayerTimeSetting Create(string deviceIdentifier, string calculationMethod, string juristicMethod, double latitude, double longitude, string cityName, string countryName, int timezoneOffsetMinutes)
    {
        return new PrayerTimeSetting
        {
            DeviceIdentifier = deviceIdentifier,
            CalculationMethod = calculationMethod,
            JuristicMethod = juristicMethod,
            Latitude = latitude,
            Longitude = longitude,
            CityName = cityName,
            CountryName = countryName,
            TimezoneOffsetMinutes = timezoneOffsetMinutes
        };
    }

    public void UpdateSettings(string calculationMethod, string juristicMethod, double latitude, double longitude, string cityName, string countryName, int timezoneOffsetMinutes)
    {
        CalculationMethod = calculationMethod;
        JuristicMethod = juristicMethod;
        Latitude = latitude;
        Longitude = longitude;
        CityName = cityName;
        CountryName = countryName;
        TimezoneOffsetMinutes = timezoneOffsetMinutes;
    }
}
