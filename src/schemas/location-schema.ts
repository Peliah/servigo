import { z } from "zod";
import { idSchema } from "./shared-schema";

export const serviceAreaSchema = z.object({
  area_id: idSchema,
  technician_id: idSchema,
  city: z.string().min(1),
  region: z.string().min(1),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  radius_km: z.number().positive().default(10),
  is_active: z.boolean().default(true),
  created_at: z.coerce.date(),
});

export type ServiceArea = z.infer<typeof serviceAreaSchema>;