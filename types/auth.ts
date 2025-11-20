export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status?: number;
}
