import { get, post, put, patch } from "../../lib/api/client";
import type { ApiResponse } from "../../lib/api/types";
import {
  CategoryListParams,
  TCategory,
  TCategoryCreate,
  TCategoryStatusUpdate,
  TCategoryUpdate,
} from "./category.types";

export const CATEGORIES_ENDPOINTS = {
  LIST: "/categories",
  DETAIL: (id: string) => `/categories/${id}`,
  CREATE: "/categories",
  UPDATE: (id: string) => `/categories/update/${id}`,
  DELETE: (id: string) => `/categories/delete/${id}`,
};

export const categoryService = {
  async getCategories(
    params?: CategoryListParams,
  ): Promise<ApiResponse<TCategory[]>> {
    const response = await get<TCategory[]>(CATEGORIES_ENDPOINTS.LIST, {
      params,
    });
    return response;
  },

  async getCategory(id: string) {
    const response = await get<TCategory>(CATEGORIES_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  async createCategory(data: TCategoryCreate): Promise<TCategory> {
    const response = await post<TCategory, TCategoryCreate>(
      CATEGORIES_ENDPOINTS.CREATE,
      data,
    );
    return response.data;
  },

  async updateCategory(id: string, data: TCategoryUpdate): Promise<TCategory> {
    const response = await put<TCategory, TCategoryUpdate>(
      CATEGORIES_ENDPOINTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  async updateStatus(
    id: string,
    data: TCategoryStatusUpdate,
  ): Promise<TCategory> {
    const response = await put<TCategory, TCategoryStatusUpdate>(
      CATEGORIES_ENDPOINTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await patch(CATEGORIES_ENDPOINTS.DELETE(id));
  },

  async toggleCategoryStatus(
    id: string,
    isActive: boolean,
  ): Promise<TCategory> {
    return this.updateStatus(id, { is_active: isActive });
  },
};
