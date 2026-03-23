namespace InternConnect.DTOs.Auth;

public class OrganizationRegisterResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public string UserType { get; set; } = "organization";
}
