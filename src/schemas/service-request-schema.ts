import { z } from "zod";
import { idSchema } from "./shared-schema";

export const serviceRequestStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'in_progress',
  'completed',
  'cancelled'
]);

export const serviceRequestSchema = z.object({
  request_id: idSchema,
  client_id: idSchema,
  technician_id: idSchema,
  service_id: idSchema,
  status: serviceRequestStatusSchema.default('pending'),
  preferred_date: z.coerce.date(),
  preferred_time: z.string().min(1),
  actual_date: z.coerce.date().optional(),
  actual_time: z.string().optional(),
  job_address: z.string().min(1),
  problem_description: z.string().min(1),
  estimated_duration: z.number().positive(), // in minutes
  total_cost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  created_at: z.coerce.date().default(() => new Date()),
  updated_at: z.coerce.date().default(() => new Date()),
});

export type ServiceRequest = z.infer<typeof serviceRequestSchema>;
export type ServiceRequestStatus = z.infer<typeof serviceRequestStatusSchema>;