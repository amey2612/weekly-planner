using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Interfaces;

namespace WeeklyPlanner.API.Controllers
{
    [ApiController]
    [Route("api/team-members")]
    public class TeamMembersController : ControllerBase
    {
        private readonly ITeamMemberService _service;

        public TeamMembersController(ITeamMemberService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var members = await _service.GetActiveAsync();
            return Ok(members);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateTeamMemberDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeactivateAsync(id);
            return NoContent();
        }
    }
}