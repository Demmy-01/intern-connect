namespace InternConnect.DTOs.Auth;

public class StudentRegisterResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string UserType { get; set; } = "student";
}
