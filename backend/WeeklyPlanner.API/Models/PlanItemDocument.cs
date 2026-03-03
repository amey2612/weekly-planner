namespace WeeklyPlanner.API.Models
{
    public class PlanItemDocument : CosmosDocument
    {
        public override string Type => "PlanItem";

        public string WeekId { get; set; } = default!; // partition key
        public string MemberId { get; set; } = default!;
        public string MemberName { get; set; } = default!;

        public string BacklogItemId { get; set; } = default!;
        public string BacklogItemTitle { get; set; } = default!;
        public string Category { get; set; } = default!;

        public int CommittedHours { get; set; }
        public int CompletedHours { get; set; }

        public string Status { get; set; } = "NotStarted";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
