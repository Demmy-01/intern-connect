using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternConnect.Models;

[Table("admin_activity_logs")]
public class AdminActivityLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("admin_id")]
    public Guid AdminId { get; set; }

    [Required]
    [Column("action")]
    public string Action { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("target_type")]
    public string? TargetType { get; set; }

    [Column("target_id")]
    public Guid? TargetId { get; set; }

    [Column("details")]
    public string? Details { get; set; }

    [MaxLength(50)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("AdminId")]
    public Admin? Admin { get; set; }
}
