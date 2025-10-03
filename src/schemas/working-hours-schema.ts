import { z } from "zod";
import { idSchema, timeHHmmSchema } from "./shared-schema";

export const workingHoursSchema = z.object({
  hours_id: idSchema,
  technician_id: idSchema,
  day_of_week: z.number().int().min(0).max(6),
  start_time: timeHHmmSchema,
  end_time: timeHHmmSchema,
  is_available: z.boolean().default(true),
});

export type WorkingHours = z.infer<typeof workingHoursSchema>;
