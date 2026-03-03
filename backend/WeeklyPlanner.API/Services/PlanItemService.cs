using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Services
{
    public class PlanItemService : IPlanItemService
    {
        private const int MAX_HOURS = 30;

        private readonly ICosmosRepository<PlanItemDocument> _planRepo;
        private readonly ICosmosRepository<BacklogItemDocument> _backlogRepo;
        private readonly ICosmosRepository<PlanningWeekDocument> _weekRepo;

        public PlanItemService(
            ICosmosRepository<PlanItemDocument> planRepo,
            ICosmosRepository<BacklogItemDocument> backlogRepo,
            ICosmosRepository<PlanningWeekDocument> weekRepo)
        {
            _planRepo = planRepo;
            _backlogRepo = backlogRepo;
            _weekRepo = weekRepo;
        }

        public async Task<IEnumerable<PlanItemDocument>> GetMyPlanAsync(
            string weekId,
            string memberId)
        {
            return await _planRepo.QueryAsync(
                "SELECT * FROM c WHERE c.weekId = @weekId AND c.memberId = @memberId",
                new Dictionary<string, object>
                {
                    { "@weekId", weekId },
                    { "@memberId", memberId }
                });
        }

        public async Task<PlanItemDocument> AddAsync(AddPlanItemDto dto)
        {
            var week = await _weekRepo.GetByIdAsync(dto.WeekId, dto.WeekId);
            if (week == null)
                throw new InvalidOperationException("Week not found.");

            if (week.State != "Planning")
                throw new InvalidOperationException("Week is not open for planning.");

            var backlog = await _backlogRepo.QueryAsync(
                "SELECT * FROM c WHERE c.id = @id",
                new Dictionary<string, object> { { "@id", dto.BacklogItemId } });

            var backlogItem = backlog.FirstOrDefault();
            if (backlogItem == null)
                throw new InvalidOperationException("Backlog item not found.");

            var currentPlan = (await GetMyPlanAsync(dto.WeekId, dto.MemberId)).ToList();

            // Prevent duplicate backlog item
            if (currentPlan.Any(p => p.BacklogItemId == dto.BacklogItemId))
                throw new InvalidOperationException("Item already added.");

            // Validate total hours <= 30
            var totalHours = currentPlan.Sum(p => p.CommittedHours) + dto.CommittedHours;
            if (totalHours > MAX_HOURS)
                throw new InvalidOperationException("Total hours exceed 30.");

            // Validate category budget
            var categoryHours = currentPlan
                .Where(p => p.Category == backlogItem.Category)
                .Sum(p => p.CommittedHours) + dto.CommittedHours;

            var maxCategoryHours = backlogItem.Category switch
            {
                "ClientFocused" => MAX_HOURS * week.ClientPct / 100,
                "TechDebt" => MAX_HOURS * week.TechDebtPct / 100,
                "RAndD" => MAX_HOURS * week.RAndDPct / 100,
                _ => 0
            };

            if (categoryHours > maxCategoryHours)
                throw new InvalidOperationException("Category budget exceeded.");

            var planItem = new PlanItemDocument
            {
                WeekId = dto.WeekId,
                MemberId = dto.MemberId,
                BacklogItemId = backlogItem.Id,
                BacklogItemTitle = backlogItem.Title,
                Category = backlogItem.Category,
                CommittedHours = dto.CommittedHours,
                CompletedHours = 0,
                Status = "NotStarted",
                CreatedAt = DateTime.UtcNow
            };

            return await _planRepo.CreateAsync(planItem);
        }

        public async Task RemoveAsync(string id, string weekId)
        {
            await _planRepo.DeleteAsync(id, weekId);
        }

        public async Task MarkReadyAsync(string weekId, string memberId)
        {
            var week = await _weekRepo.GetByIdAsync(weekId, weekId);
            if (week == null)
                throw new InvalidOperationException("Week not found.");

            var participant = week.Participants
                .FirstOrDefault(p => p.MemberId == memberId);

            if (participant == null)
                throw new InvalidOperationException("Participant not found.");

            var currentPlan = await GetMyPlanAsync(weekId, memberId);

            if (currentPlan.Sum(p => p.CommittedHours) != MAX_HOURS)
                throw new InvalidOperationException("Must plan exactly 30 hours.");

            participant.IsReady = true;

            await _weekRepo.UpsertAsync(week);
        }
    }
}