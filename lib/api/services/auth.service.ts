import { get, post } from "../client";
import { API_ENDPOINTS, STORAGE_KEYS } from "../../config";
import type {
  OTPRequestCredentials,
  OTPVerifyCredentials,
  OTPRequestResponse,
  OTPVerifyResponse,
  User,
} from "../types";

export const authService = {
  async requestOTP(
    credentials: OTPRequestCredentials,
  ): Promise<OTPRequestResponse> {
    const response = await post<OTPRequestResponse, OTPRequestCredentials>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );

    return response.data;
  },

  async verifyOTP(
    credentials: OTPVerifyCredentials,
  ): Promise<OTPVerifyResponse> {
    const response = await post<OTPVerifyResponse, OTPVerifyCredentials>(
      API_ENDPOINTS.AUTH.VERIFY,
      credentials,
    );

    if (response.status === "success" && typeof window !== "undefined") {
      console.log("Setting auth data");
      const { user, token, refresh_token } = response.data;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        location.href = "/login";
      }
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await get<User>(API_ENDPOINTS.AUTH.ME);

    if (response.status === "success" && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    }

    return response.data;
  },

  getStoredUser(): User | null {
    if (typeof window === "undefined") {
      return null;
    }

    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
