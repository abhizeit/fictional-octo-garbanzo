import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "@/app/banners/banner.service";
import { toast } from "sonner";
import {
  BannerListParams,
  TBannerCreate,
  TBannerUpdate,
} from "@/app/banners/banner.types";

export const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  list: (params?: BannerListParams) => [...bannerKeys.lists(), params] as const,
  details: () => [...bannerKeys.all, "detail"] as const,
  detail: (id: string) => [...bannerKeys.details(), id] as const,
};

export function useBanners(params?: BannerListParams) {
  return useQuery({
    queryKey: bannerKeys.list(params),
    queryFn: () => bannerService.getBanners(params),
  });
}

export function useBanner(id: string) {
  return useQuery({
    queryKey: bannerKeys.detail(id),
    queryFn: () => bannerService.getBanner(id),
    enabled: !!id,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TBannerCreate) => bannerService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      toast.success("Banner created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.error?.message || "Failed to create banner. Please try again.";
      toast.error(message);
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TBannerUpdate }) =>
      bannerService.updateBanner(id, data),
    onSuccess: (updatedBanner) => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bannerKeys.detail(updatedBanner.id),
      });
      toast.success("Banner updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.message || "Failed to update banner. Please try again.";
      toast.error(message);
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bannerService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.all });
      toast.success("Banner deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.error?.message || "Failed to delete banner. Please try again.";
      toast.error(message);
    },
  });
}

export function useToggleBannerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      bannerService.toggleBannerStatus(id, is_active),
    onSuccess: (updatedBanner) => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bannerKeys.detail(updatedBanner.id),
      });
      const status = updatedBanner.is_active ? "activated" : "deactivated";
      toast.success(`Banner ${status} successfully!`);
    },
    onError: (error: any) => {
      const message =
        error?.error?.message ||
        "Failed to update banner status. Please try again.";
      toast.error(message);
    },
  });
}
