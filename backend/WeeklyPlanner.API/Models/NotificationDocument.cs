namespace WeeklyPlanner.API.Models
{
    public class NotificationDocument : CosmosDocument
    {
        public override string Type => "Notification";

        public string RecipientId { get; set; } = default!; // partition key
        public string Message { get; set; } = default!;
        public string WeekId { get; set; } = default!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
