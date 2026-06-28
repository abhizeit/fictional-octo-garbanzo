import { get, patch, post, put } from "../../lib/api/client";
import { CustomerAddress, CustomerAddressInput } from "./customer.types";

export const customerAddressEndpoints = {
  LIST: (customerId: string) => `/customers/${customerId}/addresses`,
  CREATE: (customerId: string) => `/customers/${customerId}/addresses`,
  UPDATE: (customerId: string, addressId: string) =>
    `/customers/${customerId}/addresses/${addressId}`,
  DEFAULT: (customerId: string, addressId: string) =>
    `/customers/${customerId}/addresses/${addressId}/default`,
  DELETE: (customerId: string, addressId: string) =>
    `/customers/${customerId}/addresses/${addressId}/delete`,
};

export const customerAddressService = {
  getAddresses: async (customerId: string): Promise<CustomerAddress[]> => {
    const response = await get<CustomerAddress[]>(
      customerAddressEndpoints.LIST(customerId),
    );
    return response.data ?? [];
  },

  createAddress: async (
    customerId: string,
    data: CustomerAddressInput,
  ): Promise<CustomerAddress> => {
    const response = await post<CustomerAddress>(
      customerAddressEndpoints.CREATE(customerId),
      data,
    );
    return response.data;
  },

  updateAddress: async (
    customerId: string,
    addressId: string,
    data: Partial<CustomerAddressInput>,
  ): Promise<CustomerAddress> => {
    const response = await put<CustomerAddress>(
      customerAddressEndpoints.UPDATE(customerId, addressId),
      data,
    );
    return response.data;
  },

  setDefaultAddress: async (
    customerId: string,
    addressId: string,
  ): Promise<CustomerAddress> => {
    const response = await patch<CustomerAddress>(
      customerAddressEndpoints.DEFAULT(customerId, addressId),
    );
    return response.data;
  },

  deleteAddress: async (
    customerId: string,
    addressId: string,
  ): Promise<void> => {
    await patch(customerAddressEndpoints.DELETE(customerId, addressId));
  },
};
