import { apiClient } from "@/lib/api/client";
import {
  BannerListParams,
  BannerListResponse,
  TBanner,
  TBannerCreate,
  TBannerUpdate,
} from "./banner.types";

export const bannerService = {
  async getBanners(params?: BannerListParams): Promise<BannerListResponse> {
    const response = await apiClient.get<BannerListResponse>("/banners", {
      params,
    });
    return response.data;
  },

  async getBanner(id: string): Promise<TBanner> {
    const response = await apiClient.get<{ data: TBanner }>(`/banners/${id}`);
    return response.data.data;
  },

  async createBanner(data: TBannerCreate): Promise<TBanner> {
    const response = await apiClient.post<{ data: TBanner }>("/banners", data);
    return response.data.data;
  },

  async updateBanner(id: string, data: TBannerUpdate): Promise<TBanner> {
    const response = await apiClient.put<{ data: TBanner }>(
      `/banners/update/${id}`,
      data,
    );
    return response.data.data;
  },

  async toggleBannerStatus(id: string, is_active: boolean): Promise<TBanner> {
    const response = await apiClient.put<{ data: TBanner }>(
      `/banners/update/${id}`,
      { is_active },
    );
    return response.data.data;
  },

  async deleteBanner(id: string): Promise<void> {
    await apiClient.patch(`/banners/delete/${id}`);
  },
};
