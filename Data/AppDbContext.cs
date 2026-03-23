using InternConnect.Models;
using Microsoft.EntityFrameworkCore;

namespace InternConnect.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<Admin> Admins { get; set; }
    public DbSet<AdminActivityLog> AdminActivityLogs { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<Profile>(entity =>
        {
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasOne(p => p.User)
                  .WithOne(u => u.Profile)
                  .HasForeignKey<Profile>(p => p.Id);
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasOne(s => s.Profile)
                  .WithOne(p => p.Student)
                  .HasForeignKey<Student>(s => s.Id);
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasOne(o => o.Profile)
                  .WithOne(p => p.Organization)
                  .HasForeignKey<Organization>(o => o.Id);
        });

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasOne(a => a.Profile)
                  .WithOne(p => p.Admin)
                  .HasForeignKey<Admin>(a => a.Id);
        });

        modelBuilder.Entity<AdminActivityLog>(entity =>
        {
            entity.HasOne(a => a.Admin)
                  .WithMany()
                  .HasForeignKey(a => a.AdminId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(p => p.User)
                  .WithMany()
                  .HasForeignKey(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
