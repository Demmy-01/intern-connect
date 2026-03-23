namespace InternConnect.DTOs.Auth;

public class StudentDataDto
{
    public string? Bio { get; set; }
}

public class OrganizationDataDto
{
    public string OrganizationName { get; set; } = string.Empty;
    public string VerificationStatus { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
}

public class AdminDataDto
{
    public string Role { get; set; } = string.Empty;
    public string? Permissions { get; set; }
    public string? Department { get; set; }
}

public class CurrentUserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public bool HasCompletedOnboarding { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public StudentDataDto? StudentData { get; set; }
    public OrganizationDataDto? OrganizationData { get; set; }
    public AdminDataDto? AdminData { get; set; }
}
