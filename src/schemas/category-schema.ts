import { z } from "zod";
import { idSchema } from "./shared-schema";

export const serviceCategorySchema = z.object({
  category_id: idSchema,
  category_name: z.string().min(1),
  description: z.string().optional(),
  created_at: z.coerce.date(),
});

export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
