using InternConnect.DTOs.Auth;
using InternConnect.Helpers;
using InternConnect.Interfaces;
using InternConnect.Models;
using System.Text.Json;

namespace InternConnect.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IAdminActivityRepository _adminActivityRepository;
    private readonly JwtHelper _jwtHelper;

    public AuthService(IAuthRepository authRepository, IAdminActivityRepository adminActivityRepository, JwtHelper jwtHelper)
    {
        _authRepository = authRepository;
        _adminActivityRepository = adminActivityRepository;
        _jwtHelper = jwtHelper;
    }

    public async Task<StudentRegisterResponse> RegisterStudentAsync(StudentRegisterRequest request)
    {
        if (await _authRepository.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        if (await _authRepository.UsernameExistsAsync(request.Username))
        {
            throw new InvalidOperationException("Username already exists");
        }

        var userId = Guid.NewGuid();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Id = userId,
            Email = request.Email.ToLower(),
            PasswordHash = passwordHash,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.CreateUserAsync(user);

        var profile = new Profile
        {
            Id = userId,
            UserType = "student",
            Username = request.Username,
            DisplayName = request.Username,
            HasCompletedOnboarding = false,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var student = new Student
        {
            Id = userId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.CreateStudentProfileAsync(profile, student);

        return new StudentRegisterResponse
        {
            Id = userId,
            Email = request.Email,
            Username = request.Username,
            UserType = "student"
        };
    }

    public async Task<OrganizationRegisterResponse> RegisterOrganizationAsync(OrganizationRegisterRequest request)
    {
        if (await _authRepository.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        if (await _authRepository.UsernameExistsAsync(request.OrganizationName))
        {
            throw new InvalidOperationException("Organization name already exists");
        }

        var userId = Guid.NewGuid();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Id = userId,
            Email = request.Email.ToLower(),
            PasswordHash = passwordHash,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.CreateUserAsync(user);

        var profile = new Profile
        {
            Id = userId,
            UserType = "organization",
            Username = request.OrganizationName,
            DisplayName = request.OrganizationName,
            CompanyName = request.OrganizationName,
            Phone = request.Phone,
            HasCompletedOnboarding = false,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var organization = new Organization
        {
            Id = userId,
            OrganizationName = request.OrganizationName,
            VerificationStatus = "pending",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.CreateOrganizationProfileAsync(profile, organization);

        return new OrganizationRegisterResponse
        {
            Id = userId,
            Email = request.Email,
            OrganizationName = request.OrganizationName,
            UserType = "organization"
        };
    }

    public async Task<LoginResponse> StudentLoginAsync(LoginRequest request)
    {
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var profile = await _authRepository.GetProfileByUserIdAsync(user.Id);
        if (profile == null || profile.UserType != "student")
        {
            throw new UnauthorizedAccessException("Invalid student credentials. Please use the organization login if you are an organization.");
        }

        var token = _jwtHelper.GenerateToken(user.Id, user.Email, profile.Username, "student");

        return new LoginResponse
        {
            Token = token,
            Id = user.Id,
            Email = user.Email,
            Username = profile.Username,
            DisplayName = profile.DisplayName,
            UserType = profile.UserType,
            AvatarUrl = profile.AvatarUrl,
            HasCompletedOnboarding = profile.HasCompletedOnboarding
        };
    }

    public async Task<LoginResponse> OrganizationLoginAsync(LoginRequest request)
    {
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var profile = await _authRepository.GetProfileByUserIdAsync(user.Id);
        if (profile == null || profile.UserType != "organization")
        {
            throw new UnauthorizedAccessException("Invalid organization credentials. Please use the student login if you are a student.");
        }

        var token = _jwtHelper.GenerateToken(user.Id, user.Email, profile.Username, "organization");

        return new LoginResponse
        {
            Token = token,
            Id = user.Id,
            Email = user.Email,
            Username = profile.Username,
            DisplayName = profile.DisplayName,
            UserType = profile.UserType,
            AvatarUrl = profile.AvatarUrl,
            HasCompletedOnboarding = profile.HasCompletedOnboarding
        };
    }

    public async Task<AdminLoginResponse> AdminLoginAsync(LoginRequest request)
    {
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var profile = await _authRepository.GetProfileByUserIdAsync(user.Id);
        if (profile == null || profile.UserType != "admin")
        {
            throw new UnauthorizedAccessException("You do not have admin access.");
        }

        var admin = await _authRepository.GetAdminByIdAsync(user.Id);
        if (admin == null)
        {
            throw new UnauthorizedAccessException("You do not have admin access.");
        }

        var token = _jwtHelper.GenerateToken(user.Id, user.Email, profile.Username, "admin", admin.Role);

        await _authRepository.UpdateAdminLastLoginAsync(user.Id);

        var activityLog = new AdminActivityLog
        {
            Id = Guid.NewGuid(),
            AdminId = user.Id,
            Action = "login",
            Details = JsonSerializer.Serialize(new { timestamp = DateTimeOffset.UtcNow.ToString("o") }),
            CreatedAt = DateTimeOffset.UtcNow
        };
        await _adminActivityRepository.LogActivityAsync(activityLog);

        return new AdminLoginResponse
        {
            Token = token,
            Id = user.Id,
            Email = user.Email,
            Username = profile.Username,
            DisplayName = profile.DisplayName,
            UserType = "admin",
            AdminRole = admin.Role,
            Permissions = admin.Permissions,
            Department = admin.Department
        };
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(string email)
    {
        var user = await _authRepository.GetUserByEmailAsync(email);
        if (user == null)
        {
            return new ForgotPasswordResponse { ResetToken = null };
        }

        var resetToken = Guid.NewGuid().ToString();
        var tokenExpiry = DateTimeOffset.UtcNow.AddHours(1);

        var passwordResetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = resetToken,
            ExpiresAt = tokenExpiry,
            IsUsed = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.CreatePasswordResetTokenAsync(passwordResetToken);

        return new ForgotPasswordResponse { ResetToken = resetToken };
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        var passwordResetToken = await _authRepository.GetPasswordResetTokenAsync(token);
        if (passwordResetToken == null)
        {
            throw new InvalidOperationException("Invalid or expired reset token.");
        }

        if (passwordResetToken.IsUsed)
        {
            throw new InvalidOperationException("Invalid or expired reset token.");
        }

        if (passwordResetToken.ExpiresAt < DateTimeOffset.UtcNow)
        {
            throw new InvalidOperationException("Reset token has expired. Please request a new one.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _authRepository.UpdateUserPasswordAsync(passwordResetToken.UserId, passwordHash);
        await _authRepository.MarkPasswordResetTokenUsedAsync(passwordResetToken.Id);

        return true;
    }

    public async Task<bool> UpdatePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _authRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("Current password is incorrect.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _authRepository.UpdateUserPasswordAsync(userId, passwordHash);

        return true;
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId)
    {
        var profile = await _authRepository.GetProfileByUserIdAsync(userId);
        if (profile == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        var response = new CurrentUserResponse
        {
            Id = profile.Id,
            Email = (await _authRepository.GetUserByIdAsync(userId))?.Email ?? "",
            Username = profile.Username,
            DisplayName = profile.DisplayName,
            UserType = profile.UserType,
            Phone = profile.Phone,
            AvatarUrl = profile.AvatarUrl,
            HasCompletedOnboarding = profile.HasCompletedOnboarding,
            CreatedAt = profile.CreatedAt
        };

        switch (profile.UserType)
        {
            case "student":
                var student = await _authRepository.GetStudentByIdAsync(userId);
                if (student != null)
                {
                    response.StudentData = new StudentDataDto { Bio = student.Bio };
                }
                break;

            case "organization":
                var organization = await _authRepository.GetOrganizationByIdAsync(userId);
                if (organization != null)
                {
                    response.OrganizationData = new OrganizationDataDto
                    {
                        OrganizationName = organization.OrganizationName,
                        VerificationStatus = organization.VerificationStatus,
                        LogoUrl = organization.LogoUrl
                    };
                }
                break;

            case "admin":
                var admin = await _authRepository.GetAdminByIdAsync(userId);
                if (admin != null)
                {
                    response.AdminData = new AdminDataDto
                    {
                        Role = admin.Role,
                        Permissions = admin.Permissions,
                        Department = admin.Department
                    };
                }
                break;
        }

        return response;
    }
}
