import { PaginationParams } from "@/lib/api";
import { z } from "zod";

export enum AttributeType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
}

export const ZAttribute = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  data_type: z.nativeEnum(AttributeType),
  is_active: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const ZAttributeCreate = ZAttribute.omit({
  id: true,
  is_active: true, // Optional in backend, defaults to true
  is_deleted: true,
  created_at: true,
  updated_at: true,
});

export const ZAttributeUpdate = ZAttribute.omit({
  is_deleted: true,
  created_at: true,
  updated_at: true,
});

export type TAttribute = z.infer<typeof ZAttribute>;
export type TAttributeCreate = z.infer<typeof ZAttributeCreate>;
export type TAttributeUpdate = z.infer<typeof ZAttributeUpdate>;
export type TAttributeStatusUpdate = Pick<TAttribute, "is_active">;

export interface AttributeListParams extends PaginationParams {
  search?: string;
  is_active?: boolean;
}
