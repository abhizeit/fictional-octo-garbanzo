export type Product = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  code: string;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  _count?: {
    variants: number;
    addons: number;
  };
};

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
};

export type ProductListResponse = {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

import { z } from "zod";

export const ZProductCreate = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  is_available: z.boolean(),
  is_active: z.boolean(),
  category_ids: z.array(z.string()).min(1, "At least one category is required"),
});

export type TProductCreate = z.infer<typeof ZProductCreate>;

export const ZProductUpdate = ZProductCreate.partial();

export type TProductUpdate = z.infer<typeof ZProductUpdate>;

export type ProductCreateInput = TProductCreate;
export type ProductUpdateInput = TProductUpdate;
