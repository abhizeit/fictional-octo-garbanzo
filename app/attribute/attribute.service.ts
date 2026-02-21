import { get, post, put, patch } from "../../lib/api/client";
import type { ApiResponse } from "../../lib/api/types";
import {
  AttributeListParams,
  TAttribute,
  TAttributeCreate,
  TAttributeStatusUpdate,
  TAttributeUpdate,
} from "./attribute.types";

export const ATTRIBUTES_ENDPOINTS = {
  LIST: "/attributes",
  DETAIL: (id: string) => `/attributes/${id}`,
  CREATE: "/attributes",
  UPDATE: (id: string) => `/attributes/${id}/update`,
  DELETE: (id: string) => `/attributes/${id}/delete`,
};

export const attributeService = {
  async getAttributes(
    params?: AttributeListParams,
  ): Promise<ApiResponse<TAttribute[]>> {
    const response = await get<TAttribute[]>(ATTRIBUTES_ENDPOINTS.LIST, {
      params,
    });
    return response;
  },

  async getAttribute(id: string) {
    const response = await get<TAttribute>(ATTRIBUTES_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  async createAttribute(data: TAttributeCreate): Promise<TAttribute> {
    const response = await post<TAttribute, TAttributeCreate>(
      ATTRIBUTES_ENDPOINTS.CREATE,
      data,
    );
    return response.data;
  },

  async updateAttribute(
    id: string,
    data: TAttributeUpdate,
  ): Promise<TAttribute> {
    const response = await patch<TAttribute, TAttributeUpdate>(
      ATTRIBUTES_ENDPOINTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  async updateStatus(
    id: string,
    data: TAttributeStatusUpdate,
  ): Promise<TAttribute> {
    const response = await patch<TAttribute, TAttributeStatusUpdate>(
      ATTRIBUTES_ENDPOINTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  async deleteAttribute(id: string): Promise<void> {
    await patch(ATTRIBUTES_ENDPOINTS.DELETE(id));
  },

  async toggleAttributeStatus(
    id: string,
    isActive: boolean,
  ): Promise<TAttribute> {
    return this.updateStatus(id, { is_active: isActive });
  },
};
