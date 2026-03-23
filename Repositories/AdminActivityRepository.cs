using InternConnect.Data;
using InternConnect.Interfaces;
using InternConnect.Models;

namespace InternConnect.Repositories;

public class AdminActivityRepository : IAdminActivityRepository
{
    private readonly AppDbContext _context;

    public AdminActivityRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogActivityAsync(AdminActivityLog log)
    {
        _context.AdminActivityLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
