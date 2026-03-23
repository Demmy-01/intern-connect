namespace InternConnect.DTOs.Auth;

public class OrganizationRegisterRequest
{
    public string OrganizationName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Password { get; set; } = string.Empty;
}
