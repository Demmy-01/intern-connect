namespace InternConnect.Helpers;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> SuccessResponse(string message, T? data = default)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> ErrorResponse(string message)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default
        };
    }
}

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }

    public static ApiResponse SuccessResponse(string message, object? data = null)
    {
        return new ApiResponse
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse ErrorResponse(string message)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Data = null
        };
    }
}
