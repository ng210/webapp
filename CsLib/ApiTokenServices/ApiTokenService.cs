using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TokenServices;

public sealed class ApiTokenService : ITokenService
{
    private readonly ApiTokenOptions _options;
    private readonly ApiTokenStore _tokenStore;
    private static readonly Dictionary<string, string> ClaimMappings = new()
    {
        ["sub"] = ClaimTypes.NameIdentifier,
        ["email"] = ClaimTypes.Email,
        ["name"] = ClaimTypes.Name,
        ["given_name"] = ClaimTypes.GivenName,
        ["family_name"] = ClaimTypes.Surname,
        ["picture"] = "picture",
        ["hd"] = "hd",
        ["email_verified"] = "email_verified"
    };

    private static readonly HashSet<string> ReservedClaimTypes =
    [
        JwtRegisteredClaimNames.Jti,
        JwtRegisteredClaimNames.Iss,
        JwtRegisteredClaimNames.Aud,
        JwtRegisteredClaimNames.Exp,
        JwtRegisteredClaimNames.Iat,
        JwtRegisteredClaimNames.Nbf,

        ClaimTypes.NameIdentifier
    ];

    Func<IEnumerable<Claim>, bool>? _checkClaims = null;
    public Func<IEnumerable<Claim>, bool>? CheckClaims
    {
        get => _checkClaims;
        set => _checkClaims = value;
    }

    public ApiTokenService(
        ApiTokenOptions options,
        ApiTokenStore tokenStore)
    {
        _options = options;
        _tokenStore = tokenStore;
    }

    public string CreateToken(ClaimsPrincipal principal, IEnumerable<Claim>? additionalClaims = null)
    {
        var claims = principal.Claims
            .Where(c => _options.Claims.Any(alias =>
                ClaimMappings.TryGetValue(alias, out var claimType) &&
                claimType == c.Type))
            .ToList();

        if (additionalClaims is not null)
        {
            foreach (var claim in additionalClaims)
            {
                if (ReservedClaimTypes.Contains(claim.Type))
                {
                    throw new ArgumentException($"Claim type '{claim.Type}' is reserved!", nameof(additionalClaims));
                }
                claims.AddRange(additionalClaims);
            }
        }

        var jti = Guid.NewGuid().ToString();
        claims.Add(new Claim(JwtRegisteredClaimNames.Jti, jti));
        
        var key = new SymmetricSecurityKey(Convert.FromBase64String(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.ExpirationMinutes),
            signingCredentials: credentials);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        _tokenStore.Add(jti);
        
        return tokenString;
    }

    public void DeleteToken(string token)
    {
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        var jti = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
        if (!string.IsNullOrEmpty(jti))
        {
            _tokenStore.Remove(jti);
        }
    }

    public Task<ClaimsPrincipal> AuthenticateAsync(string token)
    {
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _options.Issuer,

            ValidateAudience = true,
            ValidAudience = _options.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(_options.Key)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(_options.ClockSkewSeconds),

            ValidAlgorithms = [ SecurityAlgorithms.HmacSha256 ],

            RequireExpirationTime = true,
            RequireSignedTokens = true
        };
        var principal = new JwtSecurityTokenHandler().ValidateToken(
                                token,
                                validationParameters,
                                out _);

        if (CheckClaims != null)
        {
            if (!CheckClaims([..principal.Claims]))
            {
                throw new SecurityTokenException("Custom claim check failed.");
            }
        }

        var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        if (string.IsNullOrEmpty(jti) || !_tokenStore.Contains(jti))
        {
            throw new SecurityTokenException("Token is not active.");
        }

        return Task.FromResult(principal);
    }

    public static void AddAuthentication(WebApplicationBuilder builder, Func<IEnumerable<Claim>, bool>? checkClaims = null)
    {
        var options = builder.Configuration.GetSection("ApiToken").Get<ApiTokenOptions>()!;
        var tokenStore = new ApiTokenStore();
        var apiTokenService = new ApiTokenService(options, tokenStore)
        {
            CheckClaims = checkClaims
        };
        builder.Services.AddSingleton(apiTokenService);

        builder.Services
            .AddAuthentication()
            .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions,
                ApiTokenAuthenticationHandler>(
                "ApiToken",
                options => { });
    }
}