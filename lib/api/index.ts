/**
 * API Services
 * Central export for all API services and utilities
 */

// Export API client
export { default as apiClient, get, post, put, patch, del } from "./client";

// Export types
export type * from "./types";

// Export services
export { authService } from "./services/auth.service";
export { categoryService } from "../../app/category/category.service";

// Export configuration
export { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from "../config";
