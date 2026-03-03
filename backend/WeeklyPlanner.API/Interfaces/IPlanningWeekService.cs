using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Interfaces
{
    public interface IPlanningWeekService
    {
        Task<IEnumerable<PlanningWeekDocument>> GetAllAsync();

        Task<PlanningWeekDocument?> GetActiveAsync();

        Task<PlanningWeekDocument> CreateAsync(CreatePlanningWeekDto dto);

        Task OpenAsync(string id);

        Task FreezeAsync(string id);

        Task CloseAsync(string id);
    }
}