using AdventApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AdventApi.Services
{
    public static class RegistrationService
    {
        static public Task<Registration?> GetRegistration(string authId, int gameId, Context dbContext)
        {
            Registration? registration = null;
            if (authId == null)
            {
                return Task.FromResult(registration);
            }
            return dbContext.Registrations
                    .FirstOrDefaultAsync(r => r.AuthId == authId && r.GameId == gameId);
        }

        static public async Task<Registration> CreateRegistration(string authId, string fullName, string email, int gameId, Context dbContext)
        {
            var newRegistration = new Registration
            {
                AuthId = authId,
                DisplayName = fullName,
                Email = email,
                GameId = gameId,
                RegisteredAt = DateTime.UtcNow,
                Role = "user"
            };
            dbContext.Registrations.Add(newRegistration);
            await dbContext.SaveChangesAsync();
            return newRegistration;
        }
    }
}
