namespace Administration.Application.Common;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(string email, string role);
}
