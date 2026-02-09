import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/app/category/category.service";
import { toast } from "sonner";
import {
  CategoryListParams,
  TCategoryCreate,
  TCategoryUpdate,
} from "@/app/category/category.types";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: CategoryListParams) =>
    [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(params?: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getCategories(params),
  });
}

/**
 * Fetch single category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TCategoryCreate) => categoryService.createCategory(data),
    onSuccess: () => {
      // Invalidate and refetch category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.error?.message || "Failed to create category. Please try again.";
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  console.log("updating category");
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TCategoryUpdate }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(updatedCategory.id),
      });
      toast.success("Category updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.message || "Failed to update category. Please try again.";
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.error?.message || "Failed to delete category. Please try again.";
      toast.error(message);
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoryService.toggleCategoryStatus(id, isActive),
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(updatedCategory.id),
      });
      const status = updatedCategory.is_active ? "activated" : "deactivated";
      toast.success(`Category ${status} successfully!`);
    },
    onError: (error: any) => {
      const message =
        error?.error?.message ||
        "Failed to update category status. Please try again.";
      toast.error(message);
    },
  });
}
