using System.Net;
using System.Text.Json;
using BuildingBlocks.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Azkar.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = "An unexpected server error occurred.",
            Detail = exception.Message
        };

        if (exception is ValidationException validationException)
        {
            statusCode = HttpStatusCode.BadRequest;
            var validationProblemDetails = new ValidationProblemDetails(validationException.Errors)
            {
                Status = (int)statusCode,
                Title = "Validation Failed",
                Detail = "One or more validation errors occurred."
            };

            context.Response.ContentType = "application/problem+json";
            context.Response.StatusCode = (int)statusCode;
            return context.Response.WriteAsync(JsonSerializer.Serialize(validationProblemDetails));
        }

        if (exception is NotFoundException notFoundException)
        {
            statusCode = HttpStatusCode.NotFound;
            problemDetails.Status = (int)statusCode;
            problemDetails.Title = "Resource Not Found";
            problemDetails.Detail = notFoundException.Message;
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}
