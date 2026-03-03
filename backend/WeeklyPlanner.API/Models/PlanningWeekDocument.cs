namespace WeeklyPlanner.API.Models
{
    public class PlanningWeekDocument : CosmosDocument
    {
        public override string Type => "PlanningWeek";

        public DateTime TuesdayDate { get; set; }
        public string State { get; set; } = "Setup";

        public int ClientPct { get; set; }
        public int TechDebtPct { get; set; }
        public int RAndDPct { get; set; }

        public string CreatedByMemberId { get; set; } = default!;

        public List<Participant> Participants { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Participant
    {
        public string MemberId { get; set; } = default!;
        public string Name { get; set; } = default!;
        public bool IsReady { get; set; }
    }
}
