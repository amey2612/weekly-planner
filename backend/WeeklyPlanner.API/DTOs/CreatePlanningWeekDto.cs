namespace WeeklyPlanner.API.DTOs
{
    public class CreatePlanningWeekDto
    {
        public DateTime TuesdayDate { get; set; }

        public int ClientPct { get; set; }
        public int TechDebtPct { get; set; }
        public int RAndDPct { get; set; }

        public string CreatedByMemberId { get; set; } = default!;
    }
}