import { z } from "zod";
import { idSchema } from "./shared-schema";

export const technicianServiceSchema = z.object({
  service_id: idSchema,
  technician_id: idSchema,
  category_id: idSchema,
  service_title: z.string().min(1),
  service_description: z.string().min(1),
  base_service_fee_estimate: z.number().nonnegative().optional(),
  transport_fee: z.number().nonnegative(),
  is_active: z.boolean().default(true),
  created_at: z.coerce.date(),
});

export type TechnicianService = z.infer<typeof technicianServiceSchema>;
