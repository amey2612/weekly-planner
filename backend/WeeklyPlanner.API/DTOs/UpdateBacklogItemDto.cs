namespace WeeklyPlanner.API.DTOs
{
    public class UpdateBacklogItemDto
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public int EstimatedHours { get; set; }
    }
}