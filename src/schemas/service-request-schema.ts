import { z } from "zod";
import { idSchema, dateStringSchema, timeSlotSchema } from "./shared-schema";

export const requestStatusEnum = z.enum([
  "pending",
  "accepted",
  "rejected",
  "completed",
  "cancelled",
]);

export const serviceRequestSchema = z.object({
  request_id: idSchema,
  client_id: idSchema,
  technician_id: idSchema,
  service_id: idSchema,
  request_status: requestStatusEnum,
  scheduled_date: dateStringSchema,
  scheduled_time_slot: timeSlotSchema, // "09:00-11:00"
  client_address: z.string().min(1),
  problem_description: z.string().min(1),
  transport_fee: z.number().nonnegative(),
  transport_fee_paid: z.boolean().default(false),
  created_at: z.coerce.date(),

  accepted_at: z.coerce.date().optional(),
  started_at: z.coerce.date().optional(),
  completed_at: z.coerce.date().optional(),
  cancelled_at: z.coerce.date().optional(),
  cancelled_by: z.enum(["client", "technician", "system"]).optional(),
  cancel_reason: z.string().optional(),
});

export type RequestStatus = z.infer<typeof requestStatusEnum>;
export type ServiceRequest = z.infer<typeof serviceRequestSchema>;
