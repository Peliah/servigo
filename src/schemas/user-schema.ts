import { z } from "zod";
import {
  idSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
  dateTimeSchema,
} from "./shared-schema";

export const userRoleEnum = z.enum(["client", "technician", "admin"]);

export const userBaseSchema = z.object({
  user_id: idSchema,
  email: emailSchema,
  password_hash: z.string().min(10),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: phoneSchema,
  profile_picture_url: urlSchema.nullable().optional(),
  date_created: dateTimeSchema,
  last_login: dateTimeSchema.nullable().optional(),
  user_type: userRoleEnum,
  is_active: z.boolean().default(true),
  email_verified_at: dateTimeSchema.nullable().optional(),
  phone_verified_at: dateTimeSchema.nullable().optional(),
});

export const clientSchema = userBaseSchema.extend({
  user_type: z.literal("client"),
  client_id: idSchema, // FK to user_id
  default_address: z.string().min(1).optional(),
});

export const technicianSchema = userBaseSchema.extend({
  user_type: z.literal("technician"),
  technician_id: idSchema, // FK to user_id
  business_name: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  years_of_experience: z.number().int().min(0).default(0),
  identity_verified: z.boolean().default(false),
  is_available: z.boolean().default(true),
});

export const adminSchema = userBaseSchema.extend({
  user_type: z.literal("admin"),
  admin_id: idSchema, // FK to user_id
  admin_role: z.enum(["super_admin", "support", "moderator"]).default("support"),
});

export const userSchema = z.discriminatedUnion("user_type", [
  clientSchema,
  technicianSchema,
  adminSchema,
]);

export type UserRole = z.infer<typeof userRoleEnum>;
export type UserBase = z.infer<typeof userBaseSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Technician = z.infer<typeof technicianSchema>;
export type Admin = z.infer<typeof adminSchema>;
export type User = z.infer<typeof userSchema>;
