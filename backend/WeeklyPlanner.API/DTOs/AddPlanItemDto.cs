namespace WeeklyPlanner.API.DTOs
{
    public class AddPlanItemDto
    {
        public string WeekId { get; set; } = default!;
        public string BacklogItemId { get; set; } = default!;
        public int CommittedHours { get; set; }
        public string MemberId { get; set; } = default!;
    }
}