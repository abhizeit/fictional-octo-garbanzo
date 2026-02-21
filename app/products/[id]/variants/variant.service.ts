import { get, post, put, patch, del } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import {
  TVariant,
  TVariantCreate,
  TVariantUpdate,
  TVariantStatusUpdate,
  VariantListParams,
} from "./variant.types";

export const VARIANT_ENDPOINTS = {
  LIST: "/variants",
  DETAIL: (id: string) => `/variants/${id}`,
  CREATE: "/variants",
  UPDATE: (id: string) => `/variants/${id}/update`,
  DELETE: (id: string) => `/variants/${id}/delete`,
  STATUS: (id: string) => `/variants/${id}/status`,
};

export const variantService = {
  getVariants: async (
    productId: string,
    params?: VariantListParams,
  ): Promise<ApiResponse<TVariant[]>> => {
    const response = await get<TVariant[]>(VARIANT_ENDPOINTS.LIST, {
      params: { ...params, product_id: productId },
    });
    return response;
  },

  getVariant: async (id: string): Promise<TVariant> => {
    const response = await get<TVariant>(VARIANT_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  createVariant: async (
    productId: string,
    data: TVariantCreate,
  ): Promise<TVariant> => {
    const response = await post<TVariant, TVariantCreate>(
      VARIANT_ENDPOINTS.CREATE,
      { ...data, product_id: productId },
    );
    return response.data;
  },

  updateVariant: async (
    id: string,
    data: TVariantUpdate,
  ): Promise<TVariant> => {
    const response = await patch<TVariant, TVariantUpdate>(
      VARIANT_ENDPOINTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  updateStatus: async (
    id: string,
    data: TVariantStatusUpdate,
  ): Promise<TVariant> => {
    const response = await patch<TVariant, TVariantStatusUpdate>(
      VARIANT_ENDPOINTS.STATUS(id),
      data,
    );
    return response.data;
  },

  deleteVariant: async (id: string): Promise<void> => {
    await patch(VARIANT_ENDPOINTS.DELETE(id));
  },

  toggleVariantStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<TVariant> => {
    return variantService.updateStatus(id, { is_active: isActive });
  },
};
