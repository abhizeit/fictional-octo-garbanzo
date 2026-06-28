import { get, patch } from "../../lib/api/client";
import {
  Customer,
  CustomerDetail,
  CustomerListParams,
  CustomerListResponse,
  CustomerUpdateInput,
} from "./customer.types";

export const CUSTOMER_ENDPOINTS = {
  LIST: "/customers",
  DETAIL: (id: string) => `/customers/${id}`,
  UPDATE: (id: string) => `/customers/${id}/update`,
  DELETE: (id: string) => `/customers/${id}/delete`,
};

export const customerService = {
  getCustomers: async (
    params?: CustomerListParams,
  ): Promise<CustomerListResponse> => {
    const response = await get<Customer[]>(CUSTOMER_ENDPOINTS.LIST, { params });
    const page = response.meta?.page ?? params?.page ?? 1;
    const limit = response.meta?.limit ?? params?.limit ?? 10;
    const total = response.meta?.total ?? 0;
    return {
      data: response.data ?? [],
      meta: {
        total,
        page,
        limit,
        total_pages:
          response.meta?.total_pages ??
          (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1),
      },
    };
  },

  getCustomer: async (id: string): Promise<CustomerDetail> => {
    const response = await get<CustomerDetail>(CUSTOMER_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  updateCustomer: async (
    id: string,
    data: CustomerUpdateInput,
  ): Promise<Customer> => {
    const response = await patch<Customer>(CUSTOMER_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  toggleCustomerStatus: async (
    id: string,
    is_active: boolean,
  ): Promise<Customer> => {
    const response = await patch<Customer>(CUSTOMER_ENDPOINTS.UPDATE(id), {
      is_active,
    });
    return response.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await patch(CUSTOMER_ENDPOINTS.DELETE(id));
  },
};
