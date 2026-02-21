import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { variantService } from "../variant.service";
import {
  TVariantCreate,
  TVariantUpdate,
  VariantListParams,
} from "../variant.types";

export const variantKeys = {
  all: ["variants"] as const,
  lists: (productId: string) =>
    [...variantKeys.all, "list", productId] as const,
  list: (productId: string, params: VariantListParams) =>
    [...variantKeys.lists(productId), { params }] as const,
  details: () => [...variantKeys.all, "detail"] as const,
  detail: (id: string) => [...variantKeys.details(), id] as const,
};

export function useVariants({
  product_id,
  params = {},
}: {
  product_id: string;
  params?: VariantListParams;
}) {
  const queryClient = useQueryClient();

  // Queries
  const variantsQuery = useQuery({
    queryKey: variantKeys.list(product_id, params),
    queryFn: () => variantService.getVariants(product_id, params),
    enabled: !!product_id, // Important: Don't execute without a product ID
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: TVariantCreate) =>
      variantService.createVariant(product_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: variantKeys.lists(product_id),
      });
      toast.success("Variant created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create variant");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TVariantUpdate }) =>
      variantService.updateVariant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: variantKeys.lists(product_id),
      });
      queryClient.invalidateQueries({
        queryKey: variantKeys.detail(variables.id),
      });
      toast.success("Variant updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update variant");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      variantService.toggleVariantStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: variantKeys.lists(product_id),
      });
      queryClient.invalidateQueries({
        queryKey: variantKeys.detail(variables.id),
      });
      toast.success(
        `Variant ${variables.isActive ? "activated" : "deactivated"} successfully`,
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => variantService.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: variantKeys.lists(product_id),
      });
      toast.success("Variant deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete variant");
    },
  });

  return {
    variantsData: variantsQuery.data,
    isLoading: variantsQuery.isLoading,
    error: variantsQuery.error,
    createMutation,
    updateMutation,
    toggleStatusMutation,
    deleteMutation,
  };
}
