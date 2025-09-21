using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectManagementApi.Models
{
    public class Task
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public Project Project { get; set; }

        public int? AssignedTo { get; set; }

        [ForeignKey("AssignedTo")]
        public User AssignedUser { get; set; }

        [Required]
        public TaskStatusEnum Status { get; set; } = TaskStatusEnum.Pending;

        [Required]
        public DateTime DueDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }

    public enum TaskStatusEnum
    {
        Pending,
        InProgress,
        Completed
    }
}