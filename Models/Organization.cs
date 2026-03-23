using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternConnect.Models;

[Table("organizations")]
public class Organization
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("organization_name")]
    public string OrganizationName { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("industry")]
    public string? Industry { get; set; }

    [MaxLength(50)]
    [Column("company_size")]
    public string? CompanySize { get; set; }

    [MaxLength(200)]
    [Column("website")]
    public string? Website { get; set; }

    [MaxLength(300)]
    [Column("address")]
    public string? Address { get; set; }

    [Column("company_description")]
    public string? CompanyDescription { get; set; }

    [Column("logo_url")]
    public string? LogoUrl { get; set; }

    [Column("banner_url")]
    public string? BannerUrl { get; set; }

    [MaxLength(20)]
    [Column("verification_status")]
    public string VerificationStatus { get; set; } = "pending";

    [Column("total_recruited_interns")]
    public int TotalRecruitedInterns { get; set; } = 0;

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("Id")]
    public Profile? Profile { get; set; }
}
