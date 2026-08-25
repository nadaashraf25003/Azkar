using MediatR;
using Microsoft.AspNetCore.Mvc;
using Quran.Application;

namespace Azkar.Api.Endpoints;

public static class QuranEndpoints
{
    public static IEndpointRouteBuilder MapQuranEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/quran").WithTags("Quran");

        group.MapGet("/surahs", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetSurahsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetSurahs")
        .WithSummary("Get list of all 114 Surahs");

        group.MapGet("/surahs/{number:int}", async (int number, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetSurahByNumberQuery(number), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
        })
        .WithName("GetSurahByNumber")
        .WithSummary("Get a specific Surah by its index");

        group.MapGet("/surahs/{number:int}/ayat", async (int number, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAyatBySurahQuery(number), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetAyatBySurah")
        .WithSummary("Get all Ayat for a specific Surah");

        group.MapGet("/tafsir", async ([FromQuery] int surahNumber, [FromQuery] int ayahNumber, [FromQuery] string? tafsirName, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetTafsirByAyahQuery(surahNumber, ayahNumber, tafsirName), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
        })
        .WithName("GetTafsirByAyah")
        .WithSummary("Get Tafsir explanation for a specific Ayah");

        group.MapGet("/reciters", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetRecitersQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetReciters")
        .WithSummary("Get list of available Quran reciters");

        return app;
    }
}
