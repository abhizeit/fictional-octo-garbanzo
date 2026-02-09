import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG, STORAGE_KEYS } from "../config";
import type { ApiError, ApiResponse } from "./types";

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return instance;
};

export const apiClient = createAxiosInstance();

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        window.location.href = "/login";
      }
    }

    const apiError = handleApiError(error);
    return Promise.reject(apiError);
  },
);

function handleApiError(error: AxiosError): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    console.log(status, data);
    return {
      status: "error",
      error: {
        code: "SERVER_ERROR",
        message: (data as any)?.message || error.message || "An error occurred",
        details: (data as any)?.details,
        statusCode: status,
      },
    };
  } else if (error.request) {
    return {
      status: "error",
      error: {
        code: "NETWORK_ERROR",
        message: "No response from server. Please check your connection.",
        statusCode: 0,
      },
    };
  } else {
    // Error in request configuration
    return {
      status: "error",
      error: {
        code: "REQUEST_ERROR",
        message: error.message || "Failed to make request",
        statusCode: 0,
      },
    };
  }
}

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data;
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data;
}

export { apiClient as default };
