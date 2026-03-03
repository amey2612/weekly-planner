using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Services
{
    public class TeamMemberService : ITeamMemberService
    {
        private readonly ICosmosRepository<TeamMemberDocument> _repository;

        public TeamMemberService(
            ICosmosRepository<TeamMemberDocument> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<TeamMemberDocument>> GetActiveAsync()
        {
            var sql = "SELECT * FROM c WHERE c.isActive = true";
            return await _repository.QueryAsync(sql);
        }

        public async Task<TeamMemberDocument> CreateAsync(
            CreateTeamMemberDto dto)
        {
            var document = new TeamMemberDocument
            {
                Name = dto.Name,
                IsLead = dto.IsLead,
                AzureAdObjectId = dto.AzureAdObjectId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            return await _repository.CreateAsync(document);
        }

        public async Task DeactivateAsync(string id)
        {
            var member = await _repository.GetByIdAsync(id, id);

            if (member == null)
                throw new InvalidOperationException("Member not found.");

            member.IsActive = false;

            await _repository.UpsertAsync(member);
        }
    }
}