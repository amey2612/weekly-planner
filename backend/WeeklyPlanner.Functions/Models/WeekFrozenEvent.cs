namespace WeeklyPlanner.Functions.Models
{
    public class WeekFrozenEvent
    {
        public string WeekId { get; set; } = default!;
        public DateTime FrozenAt { get; set; }
    }
}
