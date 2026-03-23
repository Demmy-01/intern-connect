using InternConnect.Models;

namespace InternConnect.Interfaces;

public interface IAdminActivityRepository
{
    Task LogActivityAsync(AdminActivityLog log);
}
