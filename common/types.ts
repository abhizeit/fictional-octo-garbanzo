import { z } from "zod";

export const ZSubObjects = z.object({
  id: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  sequence: z.number().nullable().optional(),
  group_name: z.string().nullable().optional(),
  count: z.number().nullable().optional(),
});

export const ZObject = z.object({
  id: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  sequence: z.number().nullable().optional(),
  sub_objects: z.array(ZSubObjects).optional().nullable(),
});

export const ZModule = z.object({
  id: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  sequence: z.number().nullable().optional(),
  objects: z.array(ZObject).nullable().optional(),
  is_reports_allowed: z.boolean().nullable().optional(),
});

export const ZUser = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TModule = z.infer<typeof ZModule>;
export type TObject = z.infer<typeof ZObject>;
export type TSubObject = z.infer<typeof ZSubObjects>;
export type TUser = z.infer<typeof ZUser>;
