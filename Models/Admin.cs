using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternConnect.Models;

[Table("admins")]
public class Admin
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [MaxLength(20)]
    [Column("role")]
    public string Role { get; set; } = "admin";

    [Column("permissions")]
    public string? Permissions { get; set; }

    [MaxLength(100)]
    [Column("department")]
    public string? Department { get; set; }

    [Column("last_login")]
    public DateTimeOffset? LastLogin { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("Id")]
    public Profile? Profile { get; set; }
}
