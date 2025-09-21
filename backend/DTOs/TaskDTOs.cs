using System.ComponentModel.DataAnnotations;
using ProjectManagementApi.Models;

namespace ProjectManagementApi.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int? AssignedTo { get; set; }
        public string? AssignedUserName { get; set; }
        public TaskStatusEnum Status { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
    }

    public class CreateTaskDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public int ProjectId { get; set; }

        public int? AssignedTo { get; set; }

        [Required]
        public DateTime DueDate { get; set; }
    }

    public class UpdateTaskDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? AssignedTo { get; set; }

        [Required]
        public DateTime DueDate { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        [Required]
        public string Content { get; set; }
    }
}