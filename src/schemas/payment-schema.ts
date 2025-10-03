import { z } from "zod";
import { idSchema } from "./shared-schema";

export const transactionStatusEnum = z.enum([
  "pending",
  "held_in_escrow",
  "released_to_technician",
  "refunded_to_client",
]);

export const paymentTransactionSchema = z.object({
  transaction_id: idSchema,
  request_id: idSchema,
  client_id: idSchema,
  amount_minor: z.number().int().nonnegative(), // minor units, e.g., XOF
  currency: z.string().length(3).default("XOF"),
  provider: z.enum(["stripe", "paypal", "none"]).default("none"),
  transaction_status: transactionStatusEnum,
  escrow_release_date: z.coerce.date().nullable().optional(),
  payment_gateway_id: z.string().optional(),
  idempotency_key: z.string().optional(),
  created_at: z.coerce.date(),
});

export type TransactionStatus = z.infer<typeof transactionStatusEnum>;
export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;
