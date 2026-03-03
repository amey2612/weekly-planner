namespace WeeklyPlanner.API.Models
{
    public class ProgressUpdateDocument : CosmosDocument
    {
        public override string Type => "ProgressUpdate";

        public string PlanItemId { get; set; } = default!; // partition key
        public string WeekId { get; set; } = default!;
        public string MemberId { get; set; } = default!;

        public int HoursLogged { get; set; }
        public string Status { get; set; } = default!;
        public string Note { get; set; } = default!;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
