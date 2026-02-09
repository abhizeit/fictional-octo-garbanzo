/**
 * Application Configuration
 * Central configuration for API endpoints and environment settings
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:3004",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    VERIFY: "/auth/verify",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: (id: string) => `/categories/${id}`,
    CREATE: "/categories",
    UPDATE: (id: string) => `/categories/update/${id}`,
    DELETE: (id: string) => `/categories/delete/${id}`,
  },
  MODULES: {
    LIST: "/modules",
    DETAIL: (id: string) => `/modules/${id}`,
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;
