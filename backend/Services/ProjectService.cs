using Microsoft.EntityFrameworkCore;
using ProjectManagementApi.Data;
using ProjectManagementApi.DTOs;
using ProjectManagementApi.Models;

namespace ProjectManagementApi.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(int userId)
        {
            var projects = await _context.Projects
                .Include(p => p.Creator)
                .Include(p => p.Members)
                    .ThenInclude(m => m.User)
                .Include(p => p.Tasks)
                .Where(p => p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId))
                .ToListAsync();

            return projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CreatedBy = p.CreatedBy,
                CreatorName = p.Creator.Name,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                CreatedAt = p.CreatedAt,
                Members = p.Members.Select(m => new ProjectMemberDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Name = m.User.Name,
                    Email = m.User.Email,
                    JoinedAt = m.JoinedAt
                }).ToList(),
                TaskCount = p.Tasks.Count
            });
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(int id, int userId)
        {
            var project = await _context.Projects
                .Include(p => p.Creator)
                .Include(p => p.Members)
                    .ThenInclude(m => m.User)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id && (p.CreatedBy == userId || p.Members.Any(m => m.UserId == userId)));

            if (project == null)
            {
                return null;
            }

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                CreatedBy = project.CreatedBy,
                CreatorName = project.Creator.Name,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                CreatedAt = project.CreatedAt,
                Members = project.Members.Select(m => new ProjectMemberDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Name = m.User.Name,
                    Email = m.User.Email,
                    JoinedAt = m.JoinedAt
                }).ToList(),
                TaskCount = project.Tasks.Count
            };
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto projectDto, int userId)
        {
            var project = new Project
            {
                Name = projectDto.Name,
                Description = projectDto.Description,
                CreatedBy = userId,
                StartDate = projectDto.StartDate,
                EndDate = projectDto.EndDate
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Agregar al creador como miembro del proyecto
            var projectMember = new ProjectMember
            {
                ProjectId = project.Id,
                UserId = userId
            };

            _context.ProjectMembers.Add(projectMember);
            await _context.SaveChangesAsync();

            var creator = await _context.Users.FindAsync(userId);

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                CreatedBy = project.CreatedBy,
                CreatorName = creator.Name,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                CreatedAt = project.CreatedAt,
                Members = new List<ProjectMemberDto>
                {
                    new ProjectMemberDto
                    {
                        Id = projectMember.Id,
                        UserId = userId,
                        Name = creator.Name,
                        Email = creator.Email,
                        JoinedAt = projectMember.JoinedAt
                    }
                },
                TaskCount = 0
            };
        }

        public async Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto projectDto, int userId)
        {
            var project = await _context.Projects
                .Include(p => p.Creator)
                .Include(p => p.Members)
                    .ThenInclude(m => m.User)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy == userId);

            if (project == null)
            {
                return null;
            }

            project.Name = projectDto.Name;
            project.Description = projectDto.Description;
            project.StartDate = projectDto.StartDate;
            project.EndDate = projectDto.EndDate;

            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                CreatedBy = project.CreatedBy,
                CreatorName = project.Creator.Name,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                CreatedAt = project.CreatedAt,
                Members = project.Members.Select(m => new ProjectMemberDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Name = m.User.Name,
                    Email = m.User.Email,
                    JoinedAt = m.JoinedAt
                }).ToList(),
                TaskCount = project.Tasks.Count
            };
        }

        public async Task<bool> DeleteProjectAsync(int id, int userId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy == userId);

            if (project == null)
            {
                return false;
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AddMemberAsync(int projectId, int memberId, int userId)
        {
            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == projectId && p.CreatedBy == userId);

            if (project == null)
            {
                return false;
            }

            var user = await _context.Users.FindAsync(memberId);
            if (user == null)
            {
                return false;
            }

            if (project.Members.Any(m => m.UserId == memberId))
            {
                return false;
            }

            var projectMember = new ProjectMember
            {
                ProjectId = projectId,
                UserId = memberId
            };

            _context.ProjectMembers.Add(projectMember);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveMemberAsync(int projectId, int memberId, int userId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.CreatedBy == userId);

            if (project == null)
            {
                return false;
            }

            var projectMember = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == memberId);

            if (projectMember == null)
            {
                return false;
            }

            // No permitir eliminar al creador del proyecto
            if (memberId == userId)
            {
                return false;
            }

            _context.ProjectMembers.Remove(projectMember);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}