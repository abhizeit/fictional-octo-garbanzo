export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

export interface ApiError {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    statusCode?: number;
  };
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}

export interface PaginatedResponse<T> {
  status: "success";
  data: T[];
  meta: Required<ResponseMeta>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface OTPRequestCredentials {
  phone: string;
}

export interface OTPVerifyCredentials {
  phone: string;
  otp: string;
}

export interface User {
  id: string;
  phone: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
}

export interface OTPRequestResponse {
  status: string;
  message: string;
  otp?: string; // Only in development mode
}

export interface OTPVerifyResponse {
  status: string;
  message: string;
  token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string | null;
    phone: string;
    role: "CUSTOMER" | "ADMIN";
  };
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  withCredentials?: boolean;
}
