import { z } from "zod";

export type TVariant = {
  id: string;
  name: string;
  price: string | number;
  sku: string | null;
  image: string | null;
  is_default: boolean;
  is_available: boolean;
  is_active: boolean;
  product_id: string;
  created_at: string;
  updated_at: string;
};

export type VariantListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  product_id?: string;
};

export const ZVariantCreate = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(z.number().positive("Price must be a positive number")),
  sku: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  is_default: z.boolean().default(false),
  is_available: z.boolean().default(true),
  is_active: z.boolean().default(true),
  product_id: z.string().uuid("Invalid product ID"),
});

export type TVariantCreate = z.infer<typeof ZVariantCreate>;

export const ZVariantUpdate = ZVariantCreate.partial().extend({
  product_id: z.string().uuid("Invalid product ID").optional(),
});

export type TVariantUpdate = z.infer<typeof ZVariantUpdate>;

export type TVariantStatusUpdate = {
  is_active: boolean;
};
