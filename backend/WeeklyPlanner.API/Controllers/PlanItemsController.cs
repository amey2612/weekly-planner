using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;

namespace WeeklyPlanner.API.Controllers
{
    [ApiController]
    [Route("api/plan-items")]
    public class PlanItemsController : ControllerBase
    {
        private readonly IPlanItemService _service;

        public PlanItemsController(IPlanItemService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] string weekId,
            [FromQuery] string memberId)
        {
            return Ok(await _service.GetMyPlanAsync(weekId, memberId));
        }

        [HttpPost]
        public async Task<IActionResult> Add(
            [FromBody] AddPlanItemDto dto)
        {
            try
            {
                return Ok(await _service.AddAsync(dto));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            string id,
            [FromQuery] string weekId)
        {
            await _service.RemoveAsync(id, weekId);
            return NoContent();
        }

        [HttpPut("ready")]
        public async Task<IActionResult> MarkReady(
            [FromQuery] string weekId,
            [FromQuery] string memberId)
        {
            try
            {
                await _service.MarkReadyAsync(weekId, memberId);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
    }
}