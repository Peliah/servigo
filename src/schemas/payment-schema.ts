import { z } from "zod";
import { idSchema } from "./shared-schema";

export const paymentStatusSchema = z.enum([
  'pending',
  'processing',
  'held_in_escrow',
  'released_to_technician',
  'refunded',
  'failed',
  'cancelled'
]);

export const paymentMethodSchema = z.enum([
  'card',
  'mobile_money',
  'cash',
  'bank_transfer'
]);

export const paymentTransactionSchema = z.object({
  transaction_id: idSchema,
  service_request_id: idSchema,
  client_id: idSchema,
  technician_id: idSchema,
  amount: z.number().positive(),
  currency: z.string().default('FCFA'),
  payment_method: paymentMethodSchema,
  status: paymentStatusSchema.default('pending'),
  gateway_transaction_id: z.string().optional(),
  gateway_response: z.record(z.string(), z.any()).optional(),
  escrow_release_date: z.coerce.date().optional(),
  released_at: z.coerce.date().optional(),
  refunded_at: z.coerce.date().optional(),
  refund_amount: z.number().nonnegative().optional(),
  refund_reason: z.string().optional(),
  created_at: z.coerce.date().default(() => new Date()),
  updated_at: z.coerce.date().default(() => new Date()),
});

export const paymentIntentSchema = z.object({
  intent_id: idSchema,
  transaction_id: idSchema,
  amount: z.number().positive(),
  currency: z.string().default('FCFA'),
  client_secret: z.string(),
  status: z.enum(['requires_payment_method', 'requires_confirmation', 'succeeded', 'canceled']),
  created_at: z.coerce.date().default(() => new Date()),
});

export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentIntent = z.infer<typeof paymentIntentSchema>;