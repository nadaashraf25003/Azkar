namespace Azkar.Api.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var method = context.Request.Method;
        var path = context.Request.Path;

        _logger.LogInformation("Incoming HTTP Request {Method} {Path}", method, path);

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        await _next(context);
        stopwatch.Stop();

        _logger.LogInformation("Completed HTTP Request {Method} {Path} responded {StatusCode} in {Elapsed}ms",
            method, path, context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
    }
}
