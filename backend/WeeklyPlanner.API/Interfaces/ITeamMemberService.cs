using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Interfaces
{
    public interface ITeamMemberService
    {
        Task<IEnumerable<TeamMemberDocument>> GetActiveAsync();

        Task<TeamMemberDocument> CreateAsync(CreateTeamMemberDto dto);

        Task DeactivateAsync(string id);
    }
}