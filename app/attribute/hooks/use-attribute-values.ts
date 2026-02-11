import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attributeValueService } from "../attribute-value.service";
import {
  AttributeValueListParams,
  TAttributeValue,
  TAttributeValueCreate,
  TAttributeValueUpdate,
} from "../attribute-value.types";

export const useAttributeValues = (params?: AttributeValueListParams) => {
  const queryClient = useQueryClient();

  const {
    data: attributeValuesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attribute-values", params],
    queryFn: () => attributeValueService.getAttributeValues(params),
  });

  const createMutation = useMutation({
    mutationFn: attributeValueService.createAttributeValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-values"] });
      toast.success("Attribute value created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create attribute value");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TAttributeValueUpdate }) =>
      attributeValueService.updateAttributeValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-values"] });
      toast.success("Attribute value updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update attribute value");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: attributeValueService.deleteAttributeValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-values"] });
      toast.success("Attribute value deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete attribute value");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      attributeValueService.toggleAttributeValueStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-values"] });
      toast.success("Attribute value status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  return {
    attributeValuesData,
    isLoading,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleStatusMutation,
  };
};
