using AdventApi.DTO;
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
    "/cards",
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

        var data = await dbContext.Questions
                            .Where(q => q.GameId == _gameId)
                            .OrderBy(q => q.QuestionDate)
                            .Select(q => new
                            {
                                Question = q,
                                Answer = q.Answers
                                    .FirstOrDefault(a => a.RegistrationId == registration.Id)
                            })
                            .ToListAsync();

        var cards = data.Select(d =>
        {
            var date = d.Question.QuestionDate;
            var lockedDate = date.AddHours(game.PublishQuestion);
            var deadlineDate = lockedDate.AddHours(game.DeadlineDelay);
            var correctedDate = deadlineDate.AddHours(game.PublishAnswerDelay);
            var card = new Card
            {
                Date = date.ToString("yyyy.MM.dd"),
                State = "locked"
            };
            var q = d.Question;

            if (DateTime.Now < lockedDate)
            {
                return card;
            }

            card.Id = q.Id;
            card.State = "open";
            card.Image = "https://via.placeholder.com/150/8B0000/FFFFFF?text=Dec.+1"; // $"/images/{q.ImagePath}";
            card.Type = "select";   //q.QuestionType;
            card.Question = q.QuestionText;
            card.Options = string.Join(';', q.Options);
            if (DateTime.Now >= deadlineDate || d.Answer != null)
            {
                card.Answer = "Baka";   // d.Answer?.AnswerText ?? "";
                card.State = "closed";
            }
            if (DateTime.Now > correctedDate)
            {
                card.Correct = q.CorrectAnswer;
            }

            return card;
        });
        return Results.Ok(cards);
    })
    .RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = "ApiToken" });
#endregion

app.Run();