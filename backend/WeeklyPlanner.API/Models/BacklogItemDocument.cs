namespace WeeklyPlanner.API.Models
{
    public class BacklogItemDocument : CosmosDocument
    {
        public override string Type => "BacklogItem";

        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string Category { get; set; } = default!; // partition key
        public int EstimatedHours { get; set; }
        public string State { get; set; } = "Available";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
