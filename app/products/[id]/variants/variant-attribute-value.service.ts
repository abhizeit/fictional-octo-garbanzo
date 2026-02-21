import { get, post, put, patch } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import {
  TVariantAttributeValue,
  TVariantAttributeValueCreate,
  TVariantAttributeValueUpdate,
  VariantAttributeValueListParams,
} from "./variant-attribute-value.types";

export const VARIANT_ATTRIBUTE_VALUES_ENDPOINTS = {
  LIST: "/variant-attribute-values",
  DETAIL: (id: string) => `/variant-attribute-values/${id}`,
  CREATE: "/variant-attribute-values",
  UPDATE: (id: string) => `/variant-attribute-values/update/${id}`,
  DELETE: (id: string) => `/variant-attribute-values/delete/${id}`,
};

export const variantAttributeValueService = {
  async getVariantAttributeValues(
    params?: VariantAttributeValueListParams,
  ): Promise<ApiResponse<TVariantAttributeValue[]>> {
    const response = await get<TVariantAttributeValue[]>(
      VARIANT_ATTRIBUTE_VALUES_ENDPOINTS.LIST,
      {
        params,
      },
    );
    return response;
  },

  async getVariantAttributeValue(id: string) {
    const response = await get<TVariantAttributeValue>(
      VARIANT_ATTRIBUTE_VALUES_ENDPOINTS.DETAIL(id),
    );
    return response.data;
  },

  async createVariantAttributeValue(
    data: TVariantAttributeValueCreate,
  ): Promise<TVariantAttributeValue> {
    const response = await post<
      TVariantAttributeValue,
      TVariantAttributeValueCreate
    >(VARIANT_ATTRIBUTE_VALUES_ENDPOINTS.CREATE, data);
    return response.data;
  },

  async updateVariantAttributeValue(
    id: string,
    data: TVariantAttributeValueUpdate,
  ): Promise<TVariantAttributeValue> {
    const response = await put<
      TVariantAttributeValue,
      TVariantAttributeValueUpdate
    >(VARIANT_ATTRIBUTE_VALUES_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  async deleteVariantAttributeValue(id: string): Promise<void> {
    await patch(VARIANT_ATTRIBUTE_VALUES_ENDPOINTS.DELETE(id));
  },
};
