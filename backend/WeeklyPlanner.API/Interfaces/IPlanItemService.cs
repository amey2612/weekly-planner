using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Interfaces
{
    public interface IPlanItemService
    {
        Task<IEnumerable<PlanItemDocument>> GetMyPlanAsync(string weekId, string memberId);

        Task<PlanItemDocument> AddAsync(AddPlanItemDto dto);

        Task RemoveAsync(string id, string weekId);

        Task MarkReadyAsync(string weekId, string memberId);

        Task<PlanItemDocument> UpdateProgressAsync(
            string id,
            string weekId,
            int completedHours,
            string status);
    }
}