import { z } from "zod";

export const idSchema = z.string().min(1);

export const emailSchema = z.string().email();

export const phoneSchema = z
  .string()
  .min(6)
  .max(20)
  .regex(/^[+0-9\-() ]+$/, "Invalid phone number");

export const urlSchema = z.string().url();

export const dateTimeSchema = z.coerce.date();

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected format YYYY-MM-DD");

export const timeHHmmSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Expected time format HH:mm");

export const timeSlotSchema = z
  .string()
  .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Expected slot format HH:mm-HH:mm");

export const latitudeSchema = z.number().min(-90).max(90);

export const longitudeSchema = z.number().min(-180).max(180);

export const timestampsSchema = z.object({
  created_at: dateTimeSchema,
  updated_at: dateTimeSchema.optional(),
  deleted_at: dateTimeSchema.nullable().optional(),
});
