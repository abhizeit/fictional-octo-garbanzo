import { get, patch } from "../../lib/api/client";
import {
  Order,
  OrderListParams,
  OrderListResponse,
  OrderStatus,
} from "./order.types";

export const ORDER_ENDPOINTS = {
  LIST: "/admin/orders",
  DETAIL: (id: string) => `/admin/orders/${id}`,
  UPDATE_STATUS: (id: string) => `/admin/orders/${id}/status`,
};

type BackendPagination = {
  limit: number;
  count: number;
  page: number;
  totalPages: number;
  totalCount: number;
};

export const orderService = {
  getOrders: async (params?: OrderListParams): Promise<OrderListResponse> => {
    const response = await get<Order[]>(ORDER_ENDPOINTS.LIST, { params });
    const pagination = (
      response as typeof response & { pagination?: BackendPagination }
    ).pagination;

    const page = pagination?.page ?? response.meta?.page ?? params?.page ?? 1;
    const limit =
      pagination?.limit ?? response.meta?.limit ?? params?.limit ?? 10;
    const total =
      pagination?.totalCount ?? response.meta?.total ?? 0;
    const totalPages =
      pagination?.totalPages ??
      response.meta?.total_pages ??
      (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

    return {
      data: response.data ?? [],
      meta: {
        total,
        page,
        limit,
        total_pages: totalPages,
      },
    };
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await get<Order>(ORDER_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await patch<Order>(ORDER_ENDPOINTS.UPDATE_STATUS(id), {
      status,
    });
    return response.data;
  },
};
