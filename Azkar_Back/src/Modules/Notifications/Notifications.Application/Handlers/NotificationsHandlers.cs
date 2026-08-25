using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.EntityFrameworkCore;
using Notifications.Application.Common;
using Notifications.Domain.Entities;

namespace Notifications.Application.Handlers;

public class SubscribeToPushCommandHandler : ICommandHandler<SubscribeToPushCommand, PushSubscriptionDto>
{
    private readonly INotificationsDbContext _context;

    public SubscribeToPushCommandHandler(INotificationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PushSubscriptionDto>> Handle(SubscribeToPushCommand request, CancellationToken cancellationToken)
    {
        var sub = await _context.PushSubscriptions
            .FirstOrDefaultAsync(s => s.DeviceIdentifier == request.DeviceIdentifier, cancellationToken);

        if (sub == null)
        {
            sub = PushSubscription.Create(
                request.DeviceIdentifier,
                request.Endpoint,
                request.P256dhKey,
                request.AuthKey,
                request.MorningAdhkar,
                request.EveningAdhkar,
                request.PrayerReminders,
                request.DailyQuote
            );
            await _context.PushSubscriptions.AddAsync(sub, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new PushSubscriptionDto(
            sub.Id,
            sub.DeviceIdentifier,
            sub.Endpoint,
            sub.MorningAdhkarEnabled,
            sub.EveningAdhkarEnabled,
            sub.PrayerRemindersEnabled,
            sub.DailyQuoteEnabled
        );

        return Result.Success(dto);
    }
}

public class UnsubscribePushCommandHandler : ICommandHandler<UnsubscribePushCommand, bool>
{
    private readonly INotificationsDbContext _context;

    public UnsubscribePushCommandHandler(INotificationsDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UnsubscribePushCommand request, CancellationToken cancellationToken)
    {
        var sub = await _context.PushSubscriptions
            .FirstOrDefaultAsync(s => s.DeviceIdentifier == request.DeviceIdentifier, cancellationToken);

        if (sub != null)
        {
            _context.PushSubscriptions.Remove(sub);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Success(true);
    }
}
