using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternConnect.Models;

[Table("profiles")]
public class Profile
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("user_type")]
    public string UserType { get; set; } = "student";

    [Required]
    [MaxLength(100)]
    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("display_name")]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("company_name")]
    public string? CompanyName { get; set; }

    [MaxLength(20)]
    [Column("phone")]
    public string? Phone { get; set; }

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Column("has_completed_onboarding")]
    public bool HasCompletedOnboarding { get; set; } = false;

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("Id")]
    public User? User { get; set; }

    public Student? Student { get; set; }
    public Organization? Organization { get; set; }
    public Admin? Admin { get; set; }
}
