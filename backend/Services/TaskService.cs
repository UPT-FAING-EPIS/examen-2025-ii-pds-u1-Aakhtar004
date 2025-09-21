using Microsoft.EntityFrameworkCore;
using ProjectManagementApi.Data;
using ProjectManagementApi.DTOs;
using ProjectManagementApi.Models;

namespace ProjectManagementApi.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;

        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskDto>> GetTasksByProjectAsync(int projectId, int userId)
        {
            // Verificar que el usuario tiene acceso al proyecto
            var hasAccess = await _context.Projects
                .AnyAsync(p => p.Id == projectId && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

            if (!hasAccess)
            {
                return Enumerable.Empty<TaskDto>();
            }

            var tasks = await _context.Tasks
                .Include(t => t.AssignedUser)
                .Include(t => t.Comments)
                    .ThenInclude(c => c.User)
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();

            return tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                ProjectName = t.Project?.Name,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                AssignedTo = t.AssignedTo,
                AssignedUserName = t.AssignedUser?.Name,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                Comments = t.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserName = c.User.Name,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
            });
        }

        public async Task<TaskDto?> GetTaskByIdAsync(int id, int userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.AssignedUser)
            .Include(t => t.Comments)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return null;
        }

        // Verificar que el usuario tiene acceso al proyecto
        var hasAccess = await _context.Projects
            .AnyAsync(p => p.Id == task.ProjectId && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

        if (!hasAccess)
        {
            return null;
        }

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                ProjectName = task.Project?.Name,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                AssignedTo = task.AssignedTo,
                AssignedUserName = task.AssignedUser?.Name,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Comments = task.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserName = c.User.Name,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
            };
        }

        public async Task<TaskDto?> CreateTaskAsync(CreateTaskDto taskDto, int userId)
    {
        // Verificar que el usuario tiene acceso al proyecto
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == taskDto.ProjectId && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

        if (project == null)
        {
            return null;
        }

            // Verificar que el usuario asignado es miembro del proyecto
            if (taskDto.AssignedTo.HasValue)
            {
                var isMember = project.Members.Any(m => m.UserId == taskDto.AssignedTo.Value);
                if (!isMember)
                {
                    return null;
                }
            }

            var task = new Models.Task
            {
                ProjectId = taskDto.ProjectId,
                Title = taskDto.Title,
                Description = taskDto.Description,
                Status = TaskStatusEnum.Pending,
                AssignedTo = taskDto.AssignedTo,
                DueDate = taskDto.DueDate
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            // Cargar el usuario asignado para obtener su nombre
            string assignedToName = null;
            if (task.AssignedTo.HasValue)
            {
                var assignedUser = await _context.Users.FindAsync(task.AssignedTo.Value);
                assignedToName = assignedUser?.Name;
            }

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                AssignedTo = task.AssignedTo,
                AssignedToName = assignedToName,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Comments = new List<CommentDto>()
            };
        }

        public async Task<TaskDto> UpdateTaskAsync(int id, UpdateTaskDto taskDto, int userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.AssignedUser)
                .Include(t => t.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return null;
            }

            // Verificar que el usuario tiene acceso al proyecto
            var hasAccess = await _context.Projects
                .AnyAsync(p => p.Id == task.ProjectId && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

            if (!hasAccess)
            {
                return null;
            }

            // Actualizar propiedades
            task.Title = taskDto.Title;
            task.Description = taskDto.Description;
            task.DueDate = taskDto.DueDate;
            task.AssignedTo = taskDto.AssignedTo;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                AssignedTo = task.AssignedTo,
                AssignedUserName = task.AssignedUser?.Name,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Comments = task.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserName = c.User.Name,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
            };
        }

        public async Task<bool> DeleteTaskAsync(int id, int userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return false;
            }

            // Verificar que el usuario es el creador del proyecto
            var isCreator = await _context.Projects
                .AnyAsync(p => p.Id == task.ProjectId && p.CreatedBy == userId);

            if (!isCreator)
            {
                return false;
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<TaskDto> AssignTaskAsync(int id, int assignedTo, int userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return null;
            }

            // Verificar que el usuario tiene acceso al proyecto
            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == task.ProjectId && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

            if (project == null)
            {
                return null;
            }

            // Verificar que el usuario asignado es miembro del proyecto
            var isMember = project.Members.Any(m => m.UserId == assignedTo);
            if (!isMember)
            {
                return null;
            }

            task.AssignedTo = assignedTo;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Cargar el usuario asignado para obtener su nombre
            var assignedUser = await _context.Users.FindAsync(assignedTo);

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                AssignedTo = task.AssignedTo,
                AssignedToName = assignedUser?.Name,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Comments = task.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserName = c.User.Name,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
            };
        }

        public async Task<TaskDto> UpdateTaskStatusAsync(int id, string status, int userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.AssignedUser)
                .Include(t => t.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return new TaskDto();
            }

            // Verificar que el usuario tiene acceso al proyecto
            var hasAccess = await _context.Projects
                .AnyAsync(p => p.Id == task.ProjectId && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

            if (!hasAccess)
            {
                return new TaskDto();
            }

            // Verificar que el estado es válido
            if (status != "pending" && status != "in_progress" && status != "completed" && status != "blocked")
            {
                return null;
            }

            // Convertir el string a TaskStatusEnum
            TaskStatusEnum taskStatus;
            switch (status)
            {
                case "pending":
                    taskStatus = TaskStatusEnum.Pending;
                    break;
                case "in_progress":
                    taskStatus = TaskStatusEnum.InProgress;
                    break;
                case "completed":
                    taskStatus = TaskStatusEnum.Completed;
                    break;
                case "blocked":
                    taskStatus = TaskStatusEnum.Blocked;
                    break;
                default:
                    // Si llegamos aquí con un estado no reconocido, lo dejamos como Pending
                    taskStatus = TaskStatusEnum.Pending;
                    break;
            }

            task.Status = taskStatus;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                AssignedTo = task.AssignedTo,
                AssignedToName = task.AssignedUser?.Name,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Comments = task.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserName = c.User.Name,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
            };
        }

        public async Task<CommentDto> AddCommentAsync(int taskId, CreateCommentDto commentDto, int userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                return new CommentDto();
            }

            // Verificar que el usuario tiene acceso al proyecto
            var hasAccess = await _context.Projects
                .AnyAsync(p => p.Id == task.ProjectId && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

            if (!hasAccess)
            {
                return new CommentDto();
            }

            var comment = new Comment
            {
                TaskId = taskId,
                UserId = userId,
                Content = commentDto.Content
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // Cargar el usuario para obtener su nombre
            var user = await _context.Users.FindAsync(userId);

            return new CommentDto
            {
                Id = comment.Id,
                TaskId = comment.TaskId,
                UserId = comment.UserId,
                UserName = user?.Name,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt
            };
        }
    }
}