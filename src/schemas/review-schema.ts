import { z } from "zod";
import { idSchema } from "./shared-schema";

export const reviewSchema = z.object({
  review_id: idSchema,
  request_id: idSchema,
  client_id: idSchema,
  technician_id: idSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  created_at: z.coerce.date(),
  is_visible: z.boolean().default(true),
});

export type Review = z.infer<typeof reviewSchema>;
