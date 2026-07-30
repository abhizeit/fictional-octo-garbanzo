import { z } from "zod";

/** Matches Prisma `product_variant` (+ nested attribute values for the admin UI). */
export type TVariant = {
  id: string;
  name: string;
  price: string | number;
  sku: string;
  image: string | null;
  is_default: boolean;
  is_available: boolean;
  is_active: boolean;
  product_id: string;
  created_at: string;
  updated_at: string;
  variant_attribute_values?: {
    id: string;
    attribute_value_id: string;
    attribute_value?: {
      id: string;
      value: string;
      attribute_id: string;
      attribute?: {
        name: string;
      };
    };
  }[];
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
  sku: z.string().min(1, "SKU is required"),
  image: z.string().optional().nullable(),
  is_default: z.boolean().default(false),
  is_available: z.boolean().default(true),
  is_active: z.boolean().default(true),
  product_id: z.string().uuid("Invalid product ID"),
  attribute_value_ids: z.array(z.string()).optional(),
});

export type TVariantCreate = z.infer<typeof ZVariantCreate>;

export const ZVariantUpdate = ZVariantCreate.partial().extend({
  product_id: z.string().uuid("Invalid product ID").optional(),
});

export type TVariantUpdate = z.infer<typeof ZVariantUpdate>;

export type TVariantStatusUpdate = {
  is_active: boolean;
};
