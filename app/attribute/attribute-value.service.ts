import { get, post, put, patch } from "../../lib/api/client";
import type { ApiResponse } from "../../lib/api/types";
import {
  AttributeValueListParams,
  TAttributeValue,
  TAttributeValueCreate,
  TAttributeValueStatusUpdate,
  TAttributeValueUpdate,
} from "./attribute-value.types";

export const ATTRIBUTE_VALUES_ENDPOINTS = {
  LIST: "/attribute-values",
  DETAIL: (id: string) => `/attribute-values/${id}`,
  CREATE: "/attribute-values",
  UPDATE: (id: string) => `/attribute-values/update/${id}`,
  DELETE: (id: string) => `/attribute-values/delete/${id}`,
};

export const attributeValueService = {
  async getAttributeValues(
    params?: AttributeValueListParams,
  ): Promise<ApiResponse<TAttributeValue[]>> {
    const response = await get<TAttributeValue[]>(
      ATTRIBUTE_VALUES_ENDPOINTS.LIST,
      {
        params,
      },
    );
    return response;
  },

  async getAttributeValue(id: string) {
    const response = await get<TAttributeValue>(
      ATTRIBUTE_VALUES_ENDPOINTS.DETAIL(id),
    );
    return response.data;
  },

  async createAttributeValue(
    data: TAttributeValueCreate,
  ): Promise<TAttributeValue> {
    const response = await post<TAttributeValue, TAttributeValueCreate>(
      ATTRIBUTE_VALUES_ENDPOINTS.CREATE,
      data,
    );
    return response.data;
  },

  async updateAttributeValue(
    id: string,
    data: TAttributeValueUpdate,
  ): Promise<TAttributeValue> {
    const response = await put<TAttributeValue, TAttributeValueUpdate>(
      ATTRIBUTE_VALUES_ENDPOINTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  async updateStatus(
    id: string,
    data: TAttributeValueStatusUpdate,
  ): Promise<TAttributeValue> {
    const response = await put<TAttributeValue, TAttributeValueStatusUpdate>(
      ATTRIBUTE_VALUES_ENDPOINTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  async deleteAttributeValue(id: string): Promise<void> {
    await patch(ATTRIBUTE_VALUES_ENDPOINTS.DELETE(id));
  },

  async toggleAttributeValueStatus(
    id: string,
    isActive: boolean,
  ): Promise<TAttributeValue> {
    return this.updateStatus(id, { is_active: isActive });
  },
};
