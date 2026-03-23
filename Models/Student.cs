using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternConnect.Models;

[Table("students")]
public class Student
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("Id")]
    public Profile? Profile { get; set; }
}
