namespace InternConnect.DTOs.Auth;

public class AdminLoginResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string UserType { get; set; } = "admin";
    public string AdminRole { get; set; } = string.Empty;
    public string? Permissions { get; set; }
    public string? Department { get; set; }
}
