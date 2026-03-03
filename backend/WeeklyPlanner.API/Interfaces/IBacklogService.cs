using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Interfaces
{
    public interface IBacklogService
    {
        Task<IEnumerable<BacklogItemDocument>> GetAsync(
            string? state,
            string? category);

        Task<BacklogItemDocument> CreateAsync(
            CreateBacklogItemDto dto);

        Task<BacklogItemDocument> UpdateAsync(
            string id,
            string category,
            UpdateBacklogItemDto dto);

        Task ArchiveAsync(string id, string category);
    }
}