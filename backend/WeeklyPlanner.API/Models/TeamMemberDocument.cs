namespace WeeklyPlanner.API.Models
{
    public class TeamMemberDocument : CosmosDocument
    {
        public override string Type => "TeamMember";

        public string Name { get; set; } = default!;
        public bool IsLead { get; set; }
        public bool IsActive { get; set; } = true;
        public string AzureAdObjectId { get; set; } = default!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
