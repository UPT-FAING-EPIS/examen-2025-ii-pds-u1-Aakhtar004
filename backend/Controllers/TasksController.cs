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
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetTasksByProject(int projectId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var tasks = await _taskService.GetTasksByProjectAsync(projectId, userId);
            
            if (tasks == null)
            {
                return NotFound();
            }
            
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var task = await _taskService.GetTaskByIdAsync(id, userId);
            
            if (task == null)
            {
                return NotFound();
            }
            
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask(CreateTaskDto taskDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var task = await _taskService.CreateTaskAsync(taskDto, userId);
            
            if (task == null)
            {
                return BadRequest();
            }
            
            return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto taskDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var task = await _taskService.UpdateTaskAsync(id, taskDto, userId);
            
            if (task == null)
            {
                return NotFound();
            }
            
            return Ok(task);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var result = await _taskService.DeleteTaskAsync(id, userId);
            
            if (!result)
            {
                return NotFound();
            }
            
            return NoContent();
        }

        [HttpPut("{id}/assign/{assignedTo}")]
        public async Task<IActionResult> AssignTask(int id, int assignedTo)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var task = await _taskService.AssignTaskAsync(id, assignedTo, userId);
            
            if (task == null)
            {
                return NotFound();
            }
            
            return Ok(task);
        }

        [HttpPut("{id}/status/{status}")]
        public async Task<IActionResult> UpdateTaskStatus(int id, string status)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var task = await _taskService.UpdateTaskStatusAsync(id, status, userId);
            
            if (task == null)
            {
                return NotFound();
            }
            
            return Ok(task);
        }

        [HttpPost("{taskId}/comments")]
        public async Task<IActionResult> AddComment(int taskId, CreateCommentDto commentDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = int.Parse(userIdClaim.Value);
            var comment = await _taskService.AddCommentAsync(taskId, commentDto, userId);
            
            if (comment == null)
            {
                return NotFound();
            }
            
            return Ok(comment);
        }
    }
}