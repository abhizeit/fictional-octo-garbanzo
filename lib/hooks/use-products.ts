import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/app/products/product.service";
import { toast } from "sonner";
import {
  ProductCreateInput,
  ProductListParams,
  ProductUpdateInput,
} from "@/app/products/product.types";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: ProductListParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateInput) =>
      productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to create product. Please try again.";
      toast.error(message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateInput }) =>
      productService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(updatedProduct.id),
      });
      toast.success("Product updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to update product. Please try again.";
      toast.error(message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Product deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to delete product. Please try again.";
      toast.error(message);
    },
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productService.toggleProductStatus(id, isActive),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(updatedProduct.id),
      });
      const status = updatedProduct.is_active ? "activated" : "deactivated";
      toast.success(`Product ${status} successfully!`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to update product status. Please try again.";
      toast.error(message);
    },
  });
}
