import { get, post, put, patch, del } from "../../lib/api/client";
import { ApiResponse } from "../../lib/api/types";
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
  UPDATE: (id: string) => `/products/update/${id}`,
  DELETE: (id: string) => `/products/${id}`,
  STATUS: (id: string) => `/products/status/${id}`,
};

export const productService = {
  getProducts: async (
    params?: ProductListParams,
  ): Promise<ProductListResponse> => {
    const response = await get<ProductListResponse>(PRODUCT_ENDPOINTS.LIST, {
      params,
    });
    return response.data;
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
    const response = await put<Product>(PRODUCT_ENDPOINTS.UPDATE(id), product);
    return response.data;
  },

  updateStatus: async (id: string, is_active: boolean): Promise<Product> => {
    const response = await put<Product>(PRODUCT_ENDPOINTS.STATUS(id), {
      is_active,
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await del(PRODUCT_ENDPOINTS.DELETE(id));
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
