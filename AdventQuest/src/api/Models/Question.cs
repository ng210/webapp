using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AdventApi.Models
{
    public enum QuestionType
    {
        FreeText,
        MultipleChoice
    }

    public class Question
    {
        public int Id { get; set; }
        [Column("game_id")]
        public required int GameId { get; set; }
        [Column("question_date")]
        public required DateOnly QuestionDate { get; set; }
        public string? Title { get; set; }
        [Column("image_path")]
        public string? ImagePath { get; set; }
        [Column("question_text")]
        public required string QuestionText { get; set; }
        [Column("question_type")]
        public required string QuestionType { get; set; }
        [Column("options")]
        public string? OptionsText { get; set; }
        public string[] Options => OptionsText?.Split('\n') ?? [];
        [Column("correct_answer")]
        public required string CorrectAnswer { get; set; }


        [ForeignKey(nameof(GameId))]
        public Game? Game { get; set; }

        public ICollection<Answer>? Answers { get; set; }
    }
}
