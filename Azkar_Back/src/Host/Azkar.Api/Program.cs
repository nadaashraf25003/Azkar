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
    typeof(Recitations.Application.GetApprovedRecitationsQuery).Assembly,
    typeof(Tasbeeh.Application.GetPresetsQuery).Assembly,
    typeof(Questions.Application.GetQuestionsQuery).Assembly,
    typeof(Content.Application.GetAsmaaAllahQuery).Assembly,
    typeof(Kids.Application.GetKidsStoriesQuery).Assembly,
    typeof(Notifications.Application.SubscribeToPushCommand).Assembly,
    typeof(Administration.Application.GetPendingReportsQuery).Assembly
);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AzkarDbContext>();
        
        try
        {
            dbContext.Database.ExecuteSqlRaw(@"
                IF EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'questions' AND t.name = 'Questions')
                BEGIN
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[questions].[Questions]') AND name = 'IsApproved')
                    BEGIN
                        ALTER TABLE [questions].[Questions] ADD [IsApproved] BIT NOT NULL CONSTRAINT [DF_Questions_IsApproved] DEFAULT 1;
                    END
                END

                IF EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'recitations' AND t.name = 'Recitations')
                BEGIN
                    ALTER TABLE [recitations].[Recitations] ALTER COLUMN [AudioUrl] NVARCHAR(MAX) NOT NULL;
                END
            ");
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(ex, "Could not apply raw IsApproved column patch.");
        }

        try
        {
            dbContext.Database.Migrate();
        }
        catch
        {
            dbContext.Database.EnsureCreated();
        }

        await DbSeeder.SeedAsync(dbContext);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during database migration or seeding.");
    }
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
app.MapRecitationsEndpoints();
app.MapTasbeehEndpoints();
app.MapQuestionsEndpoints();
app.MapContentEndpoints();
app.MapKidsEndpoints();
app.MapAdminEndpoints();

app.Run();

