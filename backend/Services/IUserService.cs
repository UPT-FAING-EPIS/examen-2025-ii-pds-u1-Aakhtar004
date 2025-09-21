using ProjectManagementApi.DTOs;
using ProjectManagementApi.Models;

namespace ProjectManagementApi.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(int id);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> UpdateUserAsync(int id, User user);
    }
}