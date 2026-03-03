using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;

namespace WeeklyPlanner.API.Controllers
{
    [ApiController]
    [Route("api/backlog")]
    public class BacklogController : ControllerBase
    {
        private readonly IBacklogService _service;

        public BacklogController(IBacklogService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] string? state,
            [FromQuery] string? category)
        {
            var result = await _service.GetAsync(state, category);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateBacklogItemDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Created("", result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            string id,
            [FromQuery] string category,
            [FromBody] UpdateBacklogItemDto dto)
        {
            var result = await _service.UpdateAsync(id, category, dto);
            return Ok(result);
        }

        [HttpPatch("{id}/archive")]
        public async Task<IActionResult> Archive(
            string id,
            [FromQuery] string category)
        {
            await _service.ArchiveAsync(id, category);
            return NoContent();
        }
    }
}