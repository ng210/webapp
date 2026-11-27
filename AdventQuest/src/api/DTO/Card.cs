namespace AdventApi.DTO
{
    public class Card
    {
        public int? Id { get; set; }
        public required string Date { get; set; }
        public required string State { get; set; }
        public string? Image { get; set; }
        public string? Type { get; set; }
        public string? Question { get; set; }
        public string? Options { get; set; }
        public string? Answer { get; set; }
        public string? Correct { get; set; }
    }
}
