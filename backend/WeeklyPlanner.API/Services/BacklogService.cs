using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Services
{
    public class BacklogService : IBacklogService
    {
        private readonly ICosmosRepository<BacklogItemDocument> _repository;

        public BacklogService(
            ICosmosRepository<BacklogItemDocument> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<BacklogItemDocument>> GetAsync(
            string? state,
            string? category)
        {
            var sql = "SELECT * FROM c WHERE 1=1";
            var parameters = new Dictionary<string, object>();

            if (!string.IsNullOrWhiteSpace(state))
            {
                sql += " AND c.state = @state";
                parameters["@state"] = state;
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                sql += " AND c.category = @category";
                parameters["@category"] = category;
            }

            return await _repository.QueryAsync(sql, parameters);
        }

        public async Task<BacklogItemDocument> CreateAsync(
            CreateBacklogItemDto dto)
        {
            var document = new BacklogItemDocument
            {
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                EstimatedHours = dto.EstimatedHours,
                State = "Available",
                CreatedAt = DateTime.UtcNow
            };

            return await _repository.CreateAsync(document);
        }

        public async Task<BacklogItemDocument> UpdateAsync(
            string id,
            string category,
            UpdateBacklogItemDto dto)
        {
            var item = await _repository.GetByIdAsync(id, category);

            if (item == null)
                throw new InvalidOperationException("Backlog item not found.");

            if (item.State == "Completed")
                throw new InvalidOperationException("Cannot edit completed item.");

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.EstimatedHours = dto.EstimatedHours;

            return await _repository.UpsertAsync(item);
        }

        public async Task ArchiveAsync(string id, string category)
        {
            var item = await _repository.GetByIdAsync(id, category);

            if (item == null)
                throw new InvalidOperationException("Backlog item not found.");

            item.State = "Archived";

            await _repository.UpsertAsync(item);
        }
    }
}