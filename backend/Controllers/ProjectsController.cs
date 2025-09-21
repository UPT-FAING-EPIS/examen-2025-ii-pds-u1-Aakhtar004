using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagementApi.DTOs;
using ProjectManagementApi.Services;
using System.Security.Claims;

namespace ProjectManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProjects()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var projects = await _projectService.GetAllProjectsAsync(userId);
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var project = await _projectService.GetProjectByIdAsync(id, userId);
            
            if (project == null)
            {
                return NotFound();
            }
            
            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto projectDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var project = await _projectService.CreateProjectAsync(projectDto, userId);
            return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto projectDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var project = await _projectService.UpdateProjectAsync(id, projectDto, userId);
            
            if (project == null)
            {
                return NotFound();
            }
            
            return Ok(project);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _projectService.DeleteProjectAsync(id, userId);
            
            if (!result)
            {
                return NotFound();
            }
            
            return NoContent();
        }

        [HttpPost("{projectId}/members/{memberId}")]
        public async Task<IActionResult> AddMember(int projectId, int memberId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _projectService.AddMemberAsync(projectId, memberId, userId);
            
            if (!result)
            {
                return BadRequest();
            }
            
            return NoContent();
        }

        [HttpDelete("{projectId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int projectId, int memberId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _projectService.RemoveMemberAsync(projectId, memberId, userId);
            
            if (!result)
            {
                return BadRequest();
            }
            
            return NoContent();
        }
    }
}