using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;
using Prayer.Application.Common;
using Prayer.Domain.Entities;

namespace Prayer.Application.Handlers;

public class GetPrayerTimesQueryHandler : IQueryHandler<GetPrayerTimesQuery, PrayerTimesDto>
{
    public Task<Result<PrayerTimesDto>> Handle(GetPrayerTimesQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
        
        var dto = new PrayerTimesDto(
            date,
            "04:42",
            "06:05",
            "12:08",
            "15:35",
            "18:12",
            "19:35",
            "Maghrib",
            "02:45:00"
        );

        return Task.FromResult(Result.Success(dto));
    }
}

public class GetQiblaDirectionQueryHandler : IQueryHandler<GetQiblaDirectionQuery, QiblaDirectionDto>
{
    public Task<Result<QiblaDirectionDto>> Handle(GetQiblaDirectionQuery request, CancellationToken cancellationToken)
    {
        const double kaabaLat = 21.422487;
        const double kaabaLng = 39.826206;

        var userLatRad = request.Latitude * Math.PI / 180.0;
        var userLngRad = request.Longitude * Math.PI / 180.0;
        var kaabaLatRad = kaabaLat * Math.PI / 180.0;
        var kaabaLngRad = kaabaLng * Math.PI / 180.0;

        var deltaLng = kaabaLngRad - userLngRad;

        var y = Math.Sin(deltaLng);
        var x = Math.Cos(userLatRad) * Math.Tan(kaabaLatRad) - Math.Sin(userLatRad) * Math.Cos(deltaLng);

        var qiblaAngle = Math.Atan2(y, x) * 180.0 / Math.PI;
        qiblaAngle = (qiblaAngle + 360.0) % 360.0;

        var dLat = kaabaLatRad - userLatRad;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(userLatRad) * Math.Cos(kaabaLatRad) *
                Math.Sin(deltaLng / 2) * Math.Sin(deltaLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        var distanceKm = Math.Round(6371.0 * c, 1);

        return Task.FromResult(Result.Success(new QiblaDirectionDto(request.Latitude, request.Longitude, Math.Round(qiblaAngle, 2), distanceKm)));
    }
}

public class SavePrayerSettingsCommandHandler : ICommandHandler<SavePrayerSettingsCommand, PrayerSettingDto>
{
    private readonly IPrayerDbContext _context;

    public SavePrayerSettingsCommandHandler(IPrayerDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PrayerSettingDto>> Handle(SavePrayerSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.PrayerSettings
            .FirstOrDefaultAsync(s => s.DeviceIdentifier == request.DeviceIdentifier, cancellationToken);

        if (setting == null)
        {
            setting = PrayerTimeSetting.Create(
                request.DeviceIdentifier,
                request.CalculationMethod,
                request.JuristicMethod,
                request.Latitude,
                request.Longitude,
                request.CityName,
                request.CountryName,
                request.TimezoneOffsetMinutes);
            await _context.PrayerSettings.AddAsync(setting, cancellationToken);
        }
        else
        {
            setting.UpdateSettings(
                request.CalculationMethod,
                request.JuristicMethod,
                request.Latitude,
                request.Longitude,
                request.CityName,
                request.CountryName,
                request.TimezoneOffsetMinutes);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new PrayerSettingDto(
            setting.DeviceIdentifier,
            setting.CalculationMethod,
            setting.JuristicMethod,
            setting.Latitude,
            setting.Longitude,
            setting.CityName,
            setting.CountryName,
            setting.TimezoneOffsetMinutes);

        return Result.Success(dto);
    }
}
