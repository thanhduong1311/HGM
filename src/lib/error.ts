export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
    public hint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleSupabaseError = (error: any): ApiError => {
  // Supabase PostgreSQL error
  if (error?.code === "P0001") {
    // This is a RAISE EXCEPTION from PostgreSQL
    return new ApiError(error.message, error.code);
  }

  // Foreign key constraint error
  if (error?.code === "23503") {
    return new ApiError(
      "Không thể xóa dữ liệu do còn ràng buộc với dữ liệu khác",
      error.code,
      error.details
    );
  }

  // Function not found error
  if (error?.code === "PGRST202") {
    return new ApiError(
      "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
      error.code,
      error.details
    );
  }

  // Default error
  return new ApiError(
    error?.message || error?.error_description || "Đã có lỗi xảy ra",
    error?.code,
    error?.details
  );
};
