using ProjectManagementApi.DTOs;
using ProjectManagementApi.Models;

namespace ProjectManagementApi.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(int userId);
        Task<ProjectDto?> GetProjectByIdAsync(int id, int userId);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto projectDto, int userId);
        Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto projectDto, int userId);
        Task<bool> DeleteProjectAsync(int id, int userId);
        Task<bool> AddMemberAsync(int projectId, int memberId, int userId);
        Task<bool> RemoveMemberAsync(int projectId, int memberId, int userId);
    }
}