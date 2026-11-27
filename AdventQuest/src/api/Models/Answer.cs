using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdventApi.Models
{
    public class Answer
    {
        public int Id { get; set; }
        [Column("registration_id")]
        public required int RegistrationId { get; set; }
        [Column("question_id")]
        public required int QuestionId { get; set; }
        [Column("answer")]
        public required string AnswerText { get; set; }
        [Column("submitted_at")]
        public required DateTime SubmittedAt { get; set; }
        [Column("admin_evaluation")] 
        public bool AdminEvaluation { get; set; }


        [ForeignKey(nameof(QuestionId))]
        public required Question Question { get; set; }

        [ForeignKey(nameof(RegistrationId))]
        public required Registration Player { get; set; }
    }
}
