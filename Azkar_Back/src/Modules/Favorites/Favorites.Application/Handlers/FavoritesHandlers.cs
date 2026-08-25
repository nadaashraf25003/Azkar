using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Favorites.Application.Common;
using Favorites.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Favorites.Application.Handlers;

public class GetFavoritesByDeviceQueryHandler : IQueryHandler<GetFavoritesByDeviceQuery, IReadOnlyList<FavoriteDto>>
{
    private readonly IFavoritesDbContext _context;

    public GetFavoritesByDeviceQueryHandler(IFavoritesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<FavoriteDto>>> Handle(GetFavoritesByDeviceQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Favorites
            .AsNoTracking()
            .Where(f => f.DeviceIdentifier == request.DeviceIdentifier && !f.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.ItemType))
        {
            query = query.Where(f => f.ItemType == request.ItemType);
        }

        var list = await query
            .OrderByDescending(f => f.CreatedAtUtc)
            .Select(f => new FavoriteDto(
                f.Id,
                f.DeviceIdentifier,
                f.ItemType,
                f.ItemId,
                f.Title,
                f.Subtitle,
                f.ExtraDataJson,
                f.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<FavoriteDto>>(list);
    }
}

public class ToggleFavoriteCommandHandler : ICommandHandler<ToggleFavoriteCommand, bool>
{
    private readonly IFavoritesDbContext _context;

    public ToggleFavoriteCommandHandler(IFavoritesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.Favorites
            .FirstOrDefaultAsync(f => f.DeviceIdentifier == request.DeviceIdentifier && f.ItemType == request.ItemType && f.ItemId == request.ItemId, cancellationToken);

        if (existing != null)
        {
            _context.Favorites.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success(false); // Removed from favorites
        }

        var fav = Favorite.Create(request.DeviceIdentifier, request.ItemType, request.ItemId, request.Title, request.Subtitle, request.ExtraDataJson);
        await _context.Favorites.AddAsync(fav, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true); // Added to favorites
    }
}
