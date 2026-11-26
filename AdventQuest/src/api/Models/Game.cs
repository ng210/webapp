using System.ComponentModel.DataAnnotations.Schema;

namespace AdventApi.Models
{
    public class Game
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        [Column("asset_path")]
        public string? AssetPath { get; set; }
        [Column("deadline_time")]
        public TimeOnly DeadlineTime { get; set; }
        [Column("publish_correct_answers")] 
        public bool PublishCorrectAnswers { get; set; }
        [Column("publish_delay_hours")]
        public int PublishDelayHours { get; set; }
        [Column("registration_mode")]
        public required string RegistrationMode { get; set; }
        [Column("is_active")]
        public bool IsActive { get; set; }


        public ICollection<Question>? Questions { get; set; }
        public ICollection<Registration>? Registrations { get; set; }
    }
}
