import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerAddressService } from "@/app/customers/customer-address.service";
import { customerKeys } from "@/lib/hooks/use-customers";
import { CustomerAddressInput } from "@/app/customers/customer.types";

export const customerAddressKeys = {
  all: (customerId: string) => ["customer-addresses", customerId] as const,
};

export function useCustomerAddresses(customerId: string) {
  return useQuery({
    queryKey: customerAddressKeys.all(customerId),
    queryFn: () => customerAddressService.getAddresses(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCustomerAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerAddressInput) =>
      customerAddressService.createAddress(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerAddressKeys.all(customerId),
      });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      toast.success("Address added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add address");
    },
  });
}

export function useUpdateCustomerAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: string;
      data: Partial<CustomerAddressInput>;
    }) => customerAddressService.updateAddress(customerId, addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerAddressKeys.all(customerId),
      });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      toast.success("Address updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update address");
    },
  });
}

export function useSetDefaultCustomerAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      customerAddressService.setDefaultAddress(customerId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerAddressKeys.all(customerId),
      });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      toast.success("Default address updated");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to set default address",
      );
    },
  });
}

export function useDeleteCustomerAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      customerAddressService.deleteAddress(customerId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerAddressKeys.all(customerId),
      });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      toast.success("Address deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete address");
    },
  });
}
