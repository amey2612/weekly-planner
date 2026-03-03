namespace WeeklyPlanner.API.DTOs
{
    public class CreateBacklogItemDto
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string Category { get; set; } = default!;
        public int EstimatedHours { get; set; }
    }
}