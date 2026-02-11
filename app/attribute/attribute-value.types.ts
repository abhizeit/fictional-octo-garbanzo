import { z } from "zod";

export const ZAttributeValue = z.object({
  id: z.uuid(),
  attribute_id: z.uuid(),
  value: z.string().min(1, "Value is required").max(100, "Value is too long"),
  is_active: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const ZAttributeValueCreate = ZAttributeValue.omit({
  id: true,
  is_active: true,
  is_deleted: true,
  created_at: true,
  updated_at: true,
});

export const ZAttributeValueUpdate = ZAttributeValue.omit({
  attribute_id: true,
  is_deleted: true,
  created_at: true,
  updated_at: true,
});

export type TAttributeValue = z.infer<typeof ZAttributeValue>;
export type TAttributeValueCreate = z.infer<typeof ZAttributeValueCreate>;
export type TAttributeValueUpdate = z.infer<typeof ZAttributeValueUpdate>;
export type TAttributeValueStatusUpdate = Pick<TAttributeValue, "is_active">;

export interface AttributeValueListParams {
  attribute_id?: string;
  search?: string;
  is_active?: boolean;
}
