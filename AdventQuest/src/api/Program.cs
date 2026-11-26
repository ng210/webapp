using AdventApi.Models;
using AdventApi.Services;
using GoogleTokenServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
int _gameId = builder.Configuration.GetValue<int>("GameId");

// A két autentikációs szolgáltatás regisztrációja.
GoogleTokenService.AddAuthentication(builder);
ApiTokenService.AddAuthentication(
    builder
    //,claims => claims.Any(c => c.Type == "Game" && c.Value == _gameId.ToString())
);

// CORS szabályozás
builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(["https://teszt.hbsz.eu", "http://localhost:5500", "https://localhost:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod();
    }));

// DB context
var connectionString = builder.Configuration.GetConnectionString("adventdb")!;
builder.Services.AddDbContext<Context>(builder => builder.UseMySQL(connectionString));

// Hitelesítés
builder.Services.AddAuthorization();


var app = builder.Build();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

#region USER
// GET /user/me
app.MapGet(
    "/users/me",
    async (HttpContext httpContext, Context dbContext) =>
    {
        var authId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(authId))
        {
            return Results.BadRequest();
        }
        var registration = await RegistrationService.GetRegistration(authId, _gameId, dbContext);
        if (registration == null)
        {
            return Results.NotFound();
        }
        return Results.Ok(registration);
    })
    .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = "ApiToken" });
#endregion

#region LOGIN/LOGOUT
// POST /auth
app.MapPost(
    "/auth",
    async (HttpContext httpContext, ApiTokenService apiTokenService, Context dbContext) =>
    {
        var user = httpContext.User;
        var authId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(authId))
        {
            return Results.BadRequest();
        }
        var registration = await RegistrationService.GetRegistration(authId, _gameId, dbContext);

        if (registration == null)
        {
            var name = user.FindFirst(ClaimTypes.Surname)?.Value;
            var givenName = user.FindFirst(ClaimTypes.GivenName)?.Value;
            var email = user.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrWhiteSpace(name) ||
                string.IsNullOrWhiteSpace(givenName) ||
                string.IsNullOrWhiteSpace(email))
            {
                return Results.BadRequest();
            }

            var fullName = $"{name} {givenName}";
            registration = await RegistrationService.CreateRegistration(authId, fullName, email, _gameId, dbContext);
        }

        var token = apiTokenService.CreateToken(httpContext.User, [new Claim("Game", $"{_gameId}")]);
        return Results.Ok(new
        {
            accessToken = token,
            tokenType = "Bearer"
        });
    })
    .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = "GoogleToken"});

// DELETE /auth
app.MapDelete(
    "/auth",
    (HttpContext context, ApiTokenService apiTokenService) =>
    {
        var authorization = context.Request.Headers.Authorization.ToString();

        if (!AuthenticationHeaderValue.TryParse(authorization, out var header) ||
            !header.Scheme.Equals("Bearer", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(header.Parameter))
        {
            return Results.Unauthorized();
        }

        apiTokenService.DeleteToken(header.Parameter);

        return Results.NoContent();
    })
    .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = "ApiToken" });
#endregion

#region Questions
// GET /questions
app.MapGet(
    "/questions",
    async (HttpContext httpContext, Context dbContext) =>
    {
        var authId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(authId))
        {
            return Results.BadRequest();
        }
        var registration = await RegistrationService.GetRegistration(authId, _gameId, dbContext);
        if (registration == null)
        {
            return Results.NotFound();
        }

        var game = dbContext.Games.FirstOrDefault(g => g.Id == _gameId);
        if (game == null)
        {
            return Results.NotFound();
        }

        var lockedDate = DateTime.Now.AddDays(1);
        var closedDate = DateTime.Now.AddHours(game.PublishDelayHours);
        var openDate = DateTime.Now;

        var data = await dbContext.Questions
                            .Where(q => q.GameId == _gameId)
                            .Join(
                                dbContext.Answers
                                    .Where(a => a.RegistrationId == registration.Id),
                                q => q.Id,
                                a => a.QuestionId,
                                (question, answer) => new { question, answer })
                            .OrderBy(q => q.question.QuestionDate)
                            .ToListAsync();

        var questions = data.Select(d =>
        {
            var date = d.question.QuestionDate.ToDateTime(new TimeOnly(0));
            var dateText = d.question.QuestionDate.ToString("yyyy-MM-dd");
            if (date >= lockedDate)
            {
                return new
                {
                    date = dateText,
                    state = "locked"
                };
            }
            if (date >= closedDate)
            {
                return new
                {
                    date = dateText,
                    state = "closed"
                };
            }
            return new
            {
                date = dateText,
                state = "open"
            };
        });
        return Results.Ok(questions);
    })
    .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = "ApiToken" });
#endregion

app.Run();