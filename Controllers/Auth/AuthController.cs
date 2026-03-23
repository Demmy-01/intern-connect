using InternConnect.DTOs.Auth;
using InternConnect.Helpers;
using InternConnect.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternConnect.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly JwtHelper _jwtHelper;

    public AuthController(IAuthService authService, JwtHelper jwtHelper)
    {
        _authService = authService;
        _jwtHelper = jwtHelper;
    }

    [HttpPost("student/register")]
    [AllowAnonymous]
    public async Task<IActionResult> StudentRegister([FromBody] StudentRegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<StudentRegisterResponse>.ErrorResponse("Validation failed"));
            }

            if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
            {
                return BadRequest(ApiResponse<StudentRegisterResponse>.ErrorResponse("Invalid email format"));
            }

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            {
                return BadRequest(ApiResponse<StudentRegisterResponse>.ErrorResponse("Password must be at least 6 characters"));
            }

            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(ApiResponse<StudentRegisterResponse>.ErrorResponse("Username is required"));
            }

            var result = await _authService.RegisterStudentAsync(request);
            return Ok(ApiResponse<StudentRegisterResponse>.SuccessResponse("Student account created successfully.", result));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<StudentRegisterResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<StudentRegisterResponse>.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("organization/register")]
    [AllowAnonymous]
    public async Task<IActionResult> OrganizationRegister([FromBody] OrganizationRegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<OrganizationRegisterResponse>.ErrorResponse("Validation failed"));
            }

            if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
            {
                return BadRequest(ApiResponse<OrganizationRegisterResponse>.ErrorResponse("Invalid email format"));
            }

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            {
                return BadRequest(ApiResponse<OrganizationRegisterResponse>.ErrorResponse("Password must be at least 6 characters"));
            }

            if (string.IsNullOrWhiteSpace(request.OrganizationName))
            {
                return BadRequest(ApiResponse<OrganizationRegisterResponse>.ErrorResponse("Organization name is required"));
            }

            var result = await _authService.RegisterOrganizationAsync(request);
            return Ok(ApiResponse<OrganizationRegisterResponse>.SuccessResponse("Organization account created successfully.", result));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<OrganizationRegisterResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<OrganizationRegisterResponse>.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("student/login")]
    [AllowAnonymous]
    public async Task<IActionResult> StudentLogin([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<LoginResponse>.ErrorResponse("Validation failed"));
            }

            var result = await _authService.StudentLoginAsync(request);
            return Ok(ApiResponse<LoginResponse>.SuccessResponse("Login successful.", result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("organization/login")]
    [AllowAnonymous]
    public async Task<IActionResult> OrganizationLogin([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<LoginResponse>.ErrorResponse("Validation failed"));
            }

            var result = await _authService.OrganizationLoginAsync(request);
            return Ok(ApiResponse<LoginResponse>.SuccessResponse("Login successful.", result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("admin/login")]
    [AllowAnonymous]
    public async Task<IActionResult> AdminLogin([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<AdminLoginResponse>.ErrorResponse("Validation failed"));
            }

            var result = await _authService.AdminLoginAsync(request);
            return Ok(ApiResponse<AdminLoginResponse>.SuccessResponse("Admin login successful.", result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<AdminLoginResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AdminLoginResponse>.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<ForgotPasswordResponse>.ErrorResponse("Validation failed"));
            }

            var result = await _authService.ForgotPasswordAsync(request.Email);
            
            return Ok(ApiResponse<ForgotPasswordResponse>.SuccessResponse(
                "If this email exists, a reset link has been sent.",
                new ForgotPasswordResponse { ResetToken = result.ResetToken }
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ForgotPasswordResponse>.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.ErrorResponse("Validation failed"));
            }

            await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
            return Ok(ApiResponse.SuccessResponse("Password reset successfully. You can now log in with your new password."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("update-password")]
    [Authorize]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.ErrorResponse("Validation failed"));
            }

            var userId = _jwtHelper.GetUserIdFromToken(User);
            await _authService.UpdatePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            return Ok(ApiResponse.SuccessResponse("Password updated successfully."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userId = _jwtHelper.GetUserIdFromToken(User);
            var result = await _authService.GetCurrentUserAsync(userId);
            return Ok(ApiResponse<CurrentUserResponse>.SuccessResponse("User retrieved successfully.", result));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ApiResponse<CurrentUserResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CurrentUserResponse>.ErrorResponse("An error occurred: " + ex.Message));
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return Ok(ApiResponse.SuccessResponse("Logged out successfully."));
    }
}
