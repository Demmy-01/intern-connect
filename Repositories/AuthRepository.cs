using InternConnect.Data;
using InternConnect.Interfaces;
using InternConnect.Models;
using Microsoft.EntityFrameworkCore;

namespace InternConnect.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly AppDbContext _context;

    public AuthRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _context.Profiles.AnyAsync(p => p.Username.ToLower() == username.ToLower());
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task CreateStudentProfileAsync(Profile profile, Student student)
    {
        _context.Profiles.Add(profile);
        _context.Students.Add(student);
        await _context.SaveChangesAsync();
    }

    public async Task CreateOrganizationProfileAsync(Profile profile, Organization organization)
    {
        _context.Profiles.Add(profile);
        _context.Organizations.Add(organization);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateUserPasswordAsync(Guid userId, string passwordHash)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.PasswordHash = passwordHash;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Profile?> GetProfileByUserIdAsync(Guid userId)
    {
        return await _context.Profiles.FindAsync(userId);
    }

    public async Task<Student?> GetStudentByIdAsync(Guid id)
    {
        return await _context.Students.FindAsync(id);
    }

    public async Task<Organization?> GetOrganizationByIdAsync(Guid id)
    {
        return await _context.Organizations.FindAsync(id);
    }

    public async Task<Admin?> GetAdminByIdAsync(Guid id)
    {
        return await _context.Admins.FindAsync(id);
    }

    public async Task UpdateAdminLastLoginAsync(Guid adminId)
    {
        var admin = await _context.Admins.FindAsync(adminId);
        if (admin != null)
        {
            admin.LastLogin = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task CreatePasswordResetTokenAsync(PasswordResetToken token)
    {
        _context.PasswordResetTokens.Add(token);
        await _context.SaveChangesAsync();
    }

    public async Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token)
    {
        return await _context.PasswordResetTokens.FirstOrDefaultAsync(t => t.Token == token);
    }

    public async Task MarkPasswordResetTokenUsedAsync(Guid tokenId)
    {
        var token = await _context.PasswordResetTokens.FindAsync(tokenId);
        if (token != null)
        {
            token.IsUsed = true;
            await _context.SaveChangesAsync();
        }
    }
}
