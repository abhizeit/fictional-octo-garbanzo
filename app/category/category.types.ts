import { PaginationParams } from "@/lib/api";
import { z } from "zod";

export const ZCategory = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    ),
  image: z.url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(500, "Description is too long").optional(),
  parent_id: z.string().optional(),
  is_active: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.date().optional(),
  created_by: z.string().optional(),
  updated_at: z.date().optional(),
  updated_by: z.string().optional(),
});

export const ZCategoryUpdate = ZCategory.omit({
  is_deleted: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
});

export const ZCategoryCreate = ZCategory.omit({
  id: true,
  is_deleted: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
});

export type TCategory = z.infer<typeof ZCategory>;
export type TCategoryCreate = z.infer<typeof ZCategoryCreate>;
export type TCategoryUpdate = z.infer<typeof ZCategoryUpdate>;
export type TCategoryStatusUpdate = Pick<TCategory, "is_active">;

export interface CategoryListParams extends PaginationParams {
  search?: string;
  is_active?: boolean;
  parent_id?: string;
}
