using InternConnect.Models;

namespace InternConnect.Interfaces;

public interface IAuthRepository
{
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByIdAsync(Guid userId);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> UsernameExistsAsync(string username);
    Task<User> CreateUserAsync(User user);
    Task CreateStudentProfileAsync(Profile profile, Student student);
    Task CreateOrganizationProfileAsync(Profile profile, Organization organization);
    Task UpdateUserPasswordAsync(Guid userId, string passwordHash);
    Task<Profile?> GetProfileByUserIdAsync(Guid userId);
    Task<Student?> GetStudentByIdAsync(Guid id);
    Task<Organization?> GetOrganizationByIdAsync(Guid id);
    Task<Admin?> GetAdminByIdAsync(Guid id);
    Task UpdateAdminLastLoginAsync(Guid adminId);
    Task CreatePasswordResetTokenAsync(PasswordResetToken token);
    Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token);
    Task MarkPasswordResetTokenUsedAsync(Guid tokenId);
}
