using InternConnect.DTOs.Auth;

namespace InternConnect.Interfaces;

public interface IAuthService
{
    Task<StudentRegisterResponse> RegisterStudentAsync(StudentRegisterRequest request);
    Task<OrganizationRegisterResponse> RegisterOrganizationAsync(OrganizationRegisterRequest request);
    Task<LoginResponse> StudentLoginAsync(LoginRequest request);
    Task<LoginResponse> OrganizationLoginAsync(LoginRequest request);
    Task<AdminLoginResponse> AdminLoginAsync(LoginRequest request);
    Task<ForgotPasswordResponse> ForgotPasswordAsync(string email);
    Task<bool> ResetPasswordAsync(string token, string newPassword);
    Task<bool> UpdatePasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId);
}
