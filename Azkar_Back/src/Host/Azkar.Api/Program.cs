using Azkar.Api.Endpoints;
using Azkar.Api.Middleware;
using BuildingBlocks.Application;
using BuildingBlocks.Infrastructure;
using BuildingBlocks.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Azkar API - Modular Clean Architecture",
        Version = "v1",
        Description = "Modular Clean Architecture ASP.NET Core Backend for Azkar Application"
    });
});

// Configure CORS for Frontend Integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Infrastructure & Persistence
builder.Services.AddBuildingBlocksInfrastructure(builder.Configuration);

// Application CQRS, MediatR & FluentValidation across all modules
builder.Services.AddBuildingBlocksApplication(
    typeof(Adhkar.Application.GetCategoriesQuery).Assembly,
    typeof(Quran.Application.GetSurahsQuery).Assembly,
    typeof(Recitations.Application.GetApprovedRecitationsQuery).Assembly,
    typeof(Tasbeeh.Application.GetPresetsQuery).Assembly,
    typeof(Questions.Application.GetQuestionsQuery).Assembly,
    typeof(Content.Application.GetAsmaaAllahQuery).Assembly,
    typeof(Kids.Application.GetKidsStoriesQuery).Assembly,
    typeof(Prayer.Application.GetPrayerTimesQuery).Assembly,
    typeof(Favorites.Application.GetFavoritesByDeviceQuery).Assembly,
    typeof(Notifications.Application.SubscribeToPushCommand).Assembly,
    typeof(Administration.Application.GetPendingReportsQuery).Assembly
);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<AzkarDbContext>();

    dbContext.Database.Migrate();
}

// Configure Middleware Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Azkar API v1");
    c.RoutePrefix = string.Empty; // Swagger UI at root
});

app.UseCors("AllowAll");

// Map Endpoints
app.MapAdhkarEndpoints();
app.MapQuranEndpoints();
app.MapRecitationsEndpoints();
app.MapTasbeehEndpoints();
app.MapQuestionsEndpoints();
app.MapContentEndpoints();
app.MapKidsEndpoints();
app.MapPrayerEndpoints();
app.MapFavoritesEndpoints();
app.MapNotificationsEndpoints();
app.MapAdminEndpoints();

app.Run();
