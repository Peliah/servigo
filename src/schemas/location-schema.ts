import { z } from "zod";
import { idSchema, latitudeSchema, longitudeSchema } from "./shared-schema";

export const technicianLocationLogSchema = z.object({
  location_id: idSchema,
  technician_id: idSchema,
  request_id: idSchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  timestamp: z.coerce.date(),
});

export const serviceAreaSchema = z.object({
  area_id: idSchema,
  technician_id: idSchema,
  city: z.string().min(1),
  region: z.string().min(1).optional(),
  postal_code: z.string().min(1).optional(),
});

export type TechnicianLocationLog = z.infer<typeof technicianLocationLogSchema>;
export type ServiceArea = z.infer<typeof serviceAreaSchema>;
