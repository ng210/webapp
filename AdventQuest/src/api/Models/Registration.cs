using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdventApi.Models
{
    public class Registration
    {
        public int Id { get; set; }
        [Column("game_id")]
        public int GameId { get; set; }
        [Column("auth_id")]
        public required string AuthId { get; set; }
        public required string Email { get; set; }
        [Column("display_name")]
        public required string DisplayName { get; set; }
        public required string Role { get; set; }
        [Column("registered_at")]
        public DateTime RegisteredAt { get; set; }


        [ForeignKey(nameof(GameId))]
        public Game? Game { get; set; }
        public ICollection<Answer> Answers { get; set; } = [];
    }
}
