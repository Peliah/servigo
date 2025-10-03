import { z } from "zod";
import { idSchema } from "./shared-schema";

export const reviewSchema = z.object({
  review_id: idSchema,
  service_request_id: idSchema,
  client_id: idSchema,
  technician_id: idSchema,
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  technician_response: z.string().optional(),
  technician_response_at: z.coerce.date().optional(),
  is_verified: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  helpful_count: z.number().nonnegative().default(0),
  created_at: z.coerce.date().default(() => new Date()),
  updated_at: z.coerce.date().default(() => new Date()),
});

export const reviewStatsSchema = z.object({
  technician_id: idSchema,
  total_reviews: z.number().nonnegative(),
  average_rating: z.number().min(0).max(5),
  rating_distribution: z.object({
    5: z.number().nonnegative(),
    4: z.number().nonnegative(),
    3: z.number().nonnegative(),
    2: z.number().nonnegative(),
    1: z.number().nonnegative(),
  }),
  recent_reviews: z.array(reviewSchema),
});

export type Review = z.infer<typeof reviewSchema>;
export type ReviewStats = z.infer<typeof reviewStatsSchema>;