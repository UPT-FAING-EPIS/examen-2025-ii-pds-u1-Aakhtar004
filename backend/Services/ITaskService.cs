using ProjectManagementApi.DTOs;

namespace ProjectManagementApi.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetTasksByProjectAsync(int projectId, int userId);
        Task<TaskDto?> GetTaskByIdAsync(int id, int userId);
        Task<TaskDto?> CreateTaskAsync(CreateTaskDto taskDto, int userId);
        Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto taskDto, int userId);
        Task<bool> DeleteTaskAsync(int id, int userId);
        Task<TaskDto?> AssignTaskAsync(int id, int assignedTo, int userId);
        Task<TaskDto?> UpdateTaskStatusAsync(int id, string status, int userId);
        Task<CommentDto?> AddCommentAsync(int taskId, CreateCommentDto commentDto, int userId);
    }
}