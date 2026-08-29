using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Administration.Application.Common;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Administration.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) GenerateToken(string email, string role)
    {
        var secretKey = _configuration["Jwt:SecretKey"] 
            ?? "Azkar_Secret_Super_Secure_Key_2026_Modular_Clean_Architecture_Token!#$99";
        var issuer = _configuration["Jwt:Issuer"] ?? "Azkar.Api";
        var audience = _configuration["Jwt:Audience"] ?? "Azkar.Client";
        var expiryMinutesStr = _configuration["Jwt:ExpiryMinutes"];
        var expiryMinutes = int.TryParse(expiryMinutesStr, out var parsed) ? parsed : 1440; // Default 24 hours

        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, email),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        var tokenDescriptor = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenString = tokenHandler.WriteToken(tokenDescriptor);

        return (tokenString, expiresAt);
    }
}
