import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { variantAttributeValueService } from "../variant-attribute-value.service";
import { toast } from "sonner";
import {
  TVariantAttributeValueCreate,
  TVariantAttributeValueUpdate,
  VariantAttributeValueListParams,
} from "../variant-attribute-value.types";

export const variantAttributeKeys = {
  all: ["variant-attributes"] as const,
  lists: () => [...variantAttributeKeys.all, "list"] as const,
  list: (params: VariantAttributeValueListParams) =>
    [...variantAttributeKeys.lists(), params] as const,
};

export function useVariantAttributes(params: VariantAttributeValueListParams) {
  return useQuery({
    queryKey: variantAttributeKeys.list(params),
    queryFn: () =>
      variantAttributeValueService.getVariantAttributeValues(params),
    enabled: !!params.variant_id,
  });
}

export function useCreateVariantAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TVariantAttributeValueCreate) =>
      variantAttributeValueService.createVariantAttributeValue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantAttributeKeys.lists() });
      toast.success("Attribute value added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add attribute value");
    },
  });
}

export function useDeleteVariantAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      variantAttributeValueService.deleteVariantAttributeValue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantAttributeKeys.lists() });
      toast.success("Attribute value deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete attribute value");
    },
  });
}
