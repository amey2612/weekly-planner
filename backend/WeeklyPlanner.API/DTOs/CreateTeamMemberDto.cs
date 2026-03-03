namespace WeeklyPlanner.API.DTOs
{
    public class CreateTeamMemberDto
    {
        public string Name { get; set; } = default!;
        public bool IsLead { get; set; }
        public string AzureAdObjectId { get; set; } = default!;
    }
}