import { z } from "zod";

export type TVariantAttributeValue = {
  id: string;
  variant_id: string;
  attribute_value_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  attribute_value: {
    id: string;
    value: string;
    attribute: {
      id: string;
      name: string;
      data_type: "text" | "number" | "boolean";
    };
  };
};

export type VariantAttributeValueListParams = {
  variant_id?: string;
  attribute_value_id?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export const ZVariantAttributeValueCreate = z.object({
  variant_id: z.string().uuid("Invalid variant ID"),
  attribute_value_id: z.string().uuid("Invalid attribute value ID"),
  is_active: z.boolean().default(true).optional(),
});

export type TVariantAttributeValueCreate = z.infer<
  typeof ZVariantAttributeValueCreate
>;

export const ZVariantAttributeValueUpdate = z.object({
  attribute_value_id: z.string().uuid("Invalid attribute value ID").optional(),
  is_active: z.boolean().optional(),
});

export type TVariantAttributeValueUpdate = z.infer<
  typeof ZVariantAttributeValueUpdate
>;
