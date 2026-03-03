using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;

namespace WeeklyPlanner.API.Controllers
{
    [ApiController]
    [Route("api/planning-weeks")]
    public class PlanningWeeksController : ControllerBase
    {
        private readonly IPlanningWeekService _service;

        public PlanningWeeksController(IPlanningWeekService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            return Ok(await _service.GetActiveAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreatePlanningWeekDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Created("", result);
        }

        [HttpPut("{id}/open")]
        public async Task<IActionResult> Open(string id)
        {
            await _service.OpenAsync(id);
            return NoContent();
        }

        [HttpPut("{id}/freeze")]
        public async Task<IActionResult> Freeze(string id)
        {
            await _service.FreezeAsync(id);
            return NoContent();
        }

        [HttpPut("{id}/close")]
        public async Task<IActionResult> Close(string id)
        {
            await _service.CloseAsync(id);
            return NoContent();
        }
    }
}