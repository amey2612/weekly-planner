using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Services
{
    public class PlanningWeekService : IPlanningWeekService
    {
        private readonly ICosmosRepository<PlanningWeekDocument> _repository;
        private readonly ICosmosRepository<TeamMemberDocument> _teamRepo;

        public PlanningWeekService(
            ICosmosRepository<PlanningWeekDocument> repository,
            ICosmosRepository<TeamMemberDocument> teamRepo)
        {
            _repository = repository;
            _teamRepo = teamRepo;
        }

        public async Task<IEnumerable<PlanningWeekDocument>> GetAllAsync()
        {
            return await _repository.QueryAsync("SELECT * FROM c");
        }

        public async Task<PlanningWeekDocument?> GetActiveAsync()
        {
            var result = await _repository.QueryAsync(
                "SELECT * FROM c WHERE c.state != 'Closed'");

            return result.FirstOrDefault();
        }

        public async Task<PlanningWeekDocument> CreateAsync(
            CreatePlanningWeekDto dto)
        {
            // Validate Tuesday
            if (dto.TuesdayDate.DayOfWeek != DayOfWeek.Tuesday)
                throw new InvalidOperationException("Date must be Tuesday.");

            // Validate percentages = 100
            if (dto.ClientPct + dto.TechDebtPct + dto.RAndDPct != 100)
                throw new InvalidOperationException("Percentages must total 100.");

            // Get active team members
            var members = await _teamRepo.QueryAsync(
                "SELECT * FROM c WHERE c.isActive = true");

            var document = new PlanningWeekDocument
            {
                TuesdayDate = dto.TuesdayDate,
                ClientPct = dto.ClientPct,
                TechDebtPct = dto.TechDebtPct,
                RAndDPct = dto.RAndDPct,
                CreatedByMemberId = dto.CreatedByMemberId,
                State = "Setup",
                Participants = members.Select(m => new Participant
                {
                    MemberId = m.Id,
                    Name = m.Name,
                    IsReady = false
                }).ToList(),
                CreatedAt = DateTime.UtcNow
            };

            return await _repository.CreateAsync(document);
        }

        public async Task OpenAsync(string id)
        {
            var week = await _repository.GetByIdAsync(id, id);

            if (week == null)
                throw new InvalidOperationException("Week not found.");

            if (week.State != "Setup")
                throw new InvalidOperationException("Only Setup week can be opened.");

            week.State = "Planning";

            await _repository.UpsertAsync(week);
        }

        public async Task FreezeAsync(string id)
        {
            var week = await _repository.GetByIdAsync(id, id);

            if (week == null)
                throw new InvalidOperationException("Week not found.");

            if (week.State != "Planning")
                throw new InvalidOperationException("Week must be in Planning state.");

            if (week.Participants.Any(p => !p.IsReady))
                throw new InvalidOperationException("All members must be ready.");

            week.State = "Frozen";

            await _repository.UpsertAsync(week);
        }

        public async Task CloseAsync(string id)
        {
            var week = await _repository.GetByIdAsync(id, id);

            if (week == null)
                throw new InvalidOperationException("Week not found.");

            if (week.State != "Frozen")
                throw new InvalidOperationException("Only frozen week can be closed.");

            week.State = "Closed";

            await _repository.UpsertAsync(week);
        }
    }
}