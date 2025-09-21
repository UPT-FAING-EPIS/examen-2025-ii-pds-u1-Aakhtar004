using ProjectManagementApi.Models;
using ProjectManagementApi.DTOs;

namespace ProjectManagementApi.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
    }
}