using Administration.Application.Common;
using BuildingBlocks.Application.CQRS;
using BuildingBlocks.Domain;
using Microsoft.Extensions.Configuration;

namespace Administration.Application.Handlers;

public class AdminLoginCommandHandler : ICommandHandler<AdminLoginCommand, AdminAuthResponseDto>
{
    private readonly IConfiguration _configuration;
    private readonly IJwtTokenService _jwtTokenService;

    public AdminLoginCommandHandler(IConfiguration configuration, IJwtTokenService jwtTokenService)
    {
        _configuration = configuration;
        _jwtTokenService = jwtTokenService;
    }

    public Task<Result<AdminAuthResponseDto>> Handle(AdminLoginCommand request, CancellationToken cancellationToken)
    {
        var configuredEmail = _configuration["AdminAuth:Email"] ?? "admin@azkar.app";
        var configuredPassword = _configuration["AdminAuth:Password"] ?? "Azkar@123";

        var inputEmail = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        var expectedEmail = configuredEmail.Trim().ToLowerInvariant();

        if (inputEmail != expectedEmail || request.Password != configuredPassword)
        {
            return Task.FromResult(Result.Failure<AdminAuthResponseDto>(
                Error.Failure("Auth.InvalidCredentials", "Invalid email or password.")
            ));
        }

        var (token, expiresAt) = _jwtTokenService.GenerateToken(expectedEmail, "Admin");

        var response = new AdminAuthResponseDto(token, expectedEmail, "Admin", expiresAt);
        return Task.FromResult(Result.Success(response));
    }
}
