using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using TokenServices;

namespace GoogleTokenServices;

public sealed class GoogleTokenService : ITokenService
{
    private readonly GoogleTokenOptions _options;

    public GoogleTokenService(GoogleTokenOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if (string.IsNullOrWhiteSpace(options.ClientId))
        {
            throw new ArgumentException("Missing Google Client ID.", nameof(options));
        }

        _options = options;
    }

    public async Task<ClaimsPrincipal> AuthenticateAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentException("Missing Google ID token.", nameof(token));
        }

        GoogleJsonWebSignature.Payload payload;

        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                token,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [_options.ClientId],
                    HostedDomain = _options.HostedDomain
                });
        }
        catch (InvalidJwtException ex)
        {
            throw new SecurityTokenException("Invalid Google ID token.", ex);
        }

        // Kötelező felhasználói adatok ellenőrzése.
        if (string.IsNullOrWhiteSpace(payload.Subject))
        {
            throw new SecurityTokenException("Missing subject claim.");
        }

        if (_options.EmailVerified.HasValue && payload.EmailVerified != _options.EmailVerified.Value)
        {
            throw new SecurityTokenException("Invalid email_verified claim.");
        }

        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            throw new SecurityTokenException("Missing email claim.");
        }

        // Claims előállítása.
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, payload.Subject),
            new(ClaimTypes.Email, payload.Email)
        };
        AddClaim(claims, ClaimTypes.Name, payload.Name);
        AddClaim(claims, ClaimTypes.GivenName, payload.GivenName);
        AddClaim(claims, ClaimTypes.Surname, payload.FamilyName);
        AddClaim(claims, "picture", payload.Picture);
        AddClaim(claims, "email_verified", payload.EmailVerified.ToString().ToLowerInvariant());
        AddClaim(claims, "hd", payload.HostedDomain);

        var identity = new ClaimsIdentity(claims, "Google");

        return new ClaimsPrincipal(identity);
    }

    private static void AddClaim(
        List<Claim> claims,
        string type,
        string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
            claims.Add(new Claim(type, value));
    }

    public static void AddAuthentication(WebApplicationBuilder builder, Func<IEnumerable<Claim>, bool>? checkClaims = null)
    {
        builder.Services.Configure<GoogleTokenOptions>(builder.Configuration.GetSection("GoogleToken"));

        var options = builder.Configuration.GetSection("GoogleToken").Get<GoogleTokenOptions>() ??
                        throw new InvalidOperationException("GoogleToken configuration is missing.");
        // builder.Services.AddSingleton(options);
        var service = new GoogleTokenService(options);
        builder.Services.AddSingleton(service);
        builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "GoogleToken";
                options.DefaultChallengeScheme = "GoogleToken";
            })
            .AddScheme<AuthenticationSchemeOptions, GoogleTokenAuthenticationHandler>(
                "GoogleToken",
                options => { });
    }

    public string CreateToken(ClaimsPrincipal principal, IEnumerable<Claim>? additionalClaims = null)
    {
        throw new NotImplementedException();
    }
}