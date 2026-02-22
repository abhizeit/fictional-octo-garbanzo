export type BannerLinkType = "CATEGORY" | "PRODUCT" | "EXTERNAL";

export interface TBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_type: BannerLinkType;
  link_value: string;
  is_active: boolean;
  position?: number | null;
  created_at: string;
}

export interface TBannerCreate {
  title: string;
  subtitle?: string;
  image_url: string;
  link_type: BannerLinkType;
  link_value: string;
  is_active?: boolean;
  position?: number;
}

export interface TBannerUpdate {
  title?: string;
  subtitle?: string;
  image_url?: string;
  link_type?: BannerLinkType;
  link_value?: string;
  is_active?: boolean;
  position?: number;
}

export interface BannerListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface BannerListResponse {
  data: TBanner[];
  meta: {
    total: number;
    total_pages: number;
    page: number;
    limit: number;
  };
}
