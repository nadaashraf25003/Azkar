using BuildingBlocks.Application.CQRS;

namespace Favorites.Application;

public record FavoriteDto(Guid Id, string DeviceIdentifier, string ItemType, string ItemId, string Title, string Subtitle, string ExtraDataJson, DateTime CreatedAtUtc);

// Queries
public record GetFavoritesByDeviceQuery(string DeviceIdentifier, string? ItemType = null) : IQuery<IReadOnlyList<FavoriteDto>>;

// Commands
public record ToggleFavoriteCommand(string DeviceIdentifier, string ItemType, string ItemId, string Title, string Subtitle = "", string ExtraDataJson = "{}") : ICommand<bool>;
