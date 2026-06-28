import { get, post, put, patch } from "../../lib/api/client";
import {
  Product,
  ProductCreateInput,
  ProductListParams,
  ProductListResponse,
  ProductUpdateInput,
} from "./product.types";

export const PRODUCT_ENDPOINTS = {
  LIST: "/products",
  DETAIL: (id: string) => `/products/${id}`,
  CREATE: "/products",
  UPDATE: (id: string) => `/products/${id}/update`,
  DELETE: (id: string) => `/products/${id}/delete`,
  STATUS: (id: string) => `/products/${id}/status`,
};

export const productService = {
  getProducts: async (
    params?: ProductListParams,
  ): Promise<ProductListResponse> => {
    const response = await get<Product[]>(PRODUCT_ENDPOINTS.LIST, { params });
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

  getProduct: async (id: string): Promise<Product> => {
    const response = await get<Product>(PRODUCT_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  createProduct: async (product: ProductCreateInput): Promise<Product> => {
    const response = await post<Product>(PRODUCT_ENDPOINTS.CREATE, product);
    return response.data;
  },

  updateProduct: async (
    id: string,
    product: ProductUpdateInput,
  ): Promise<Product> => {
    const response = await patch<Product>(
      PRODUCT_ENDPOINTS.UPDATE(id),
      product,
    );
    return response.data;
  },

  updateStatus: async (id: string, is_active: boolean): Promise<Product> => {
    const response = await put<Product>(PRODUCT_ENDPOINTS.STATUS(id), {
      is_active,
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await patch(PRODUCT_ENDPOINTS.DELETE(id));
  },

  toggleProductStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<Product> => {
    const response = await patch<Product>(PRODUCT_ENDPOINTS.STATUS(id), {
      is_active: isActive,
    });
    return response.data;
  },
};
