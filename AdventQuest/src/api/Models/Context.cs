using Microsoft.EntityFrameworkCore;

namespace AdventApi.Models
{
    public class Context : DbContext
    {
        public DbSet<Game> Games { get; set; }
        public DbSet<Registration> Registrations { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }

        public Context(DbContextOptions<Context> options) : base(options) { }
    }
}
