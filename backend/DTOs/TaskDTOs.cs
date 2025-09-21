using System.ComponentModel.DataAnnotations;

namespace ProjectManagementApi.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
        public int? AssignedTo { get; set; }
        public string AssignedUserName { get; set; }
        public string Status { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CommentDto> Comments { get; set; }
    }

    public class CreateTaskDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        public string Description { get; set; }

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
        public string Title { get; set; }

        public string Description { get; set; }

        public int? AssignedTo { get; set; }

        [Required]
        public DateTime DueDate { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        [Required]
        public string Content { get; set; }
    }
}