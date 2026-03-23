namespace InternConnect.DTOs.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool HasCompletedOnboarding { get; set; }
}
