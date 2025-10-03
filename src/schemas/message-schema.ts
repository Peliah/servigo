import { z } from "zod";
import { idSchema } from "./shared-schema";

export const messageTypeSchema = z.enum([
  'text',
  'image',
  'file',
  'transport_fee_proposal',
  'payment_confirmation',
  'service_update',
  'system_notification'
]);

export const messageSchema = z.object({
  message_id: idSchema,
  service_request_id: idSchema,
  sender_id: idSchema,
  sender_type: z.enum(['client', 'technician', 'system']),
  message_type: messageTypeSchema.default('text'),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
  is_read: z.boolean().default(false),
  read_at: z.coerce.date().optional(),
  created_at: z.coerce.date().default(() => new Date()),
});

export const conversationSchema = z.object({
  conversation_id: idSchema,
  service_request_id: idSchema,
  client_id: idSchema,
  technician_id: idSchema,
  last_message_id: idSchema.optional(),
  last_message_at: z.coerce.date().optional(),
  is_active: z.boolean().default(true),
  created_at: z.coerce.date().default(() => new Date()),
  updated_at: z.coerce.date().default(() => new Date()),
});

export type Message = z.infer<typeof messageSchema>;
export type MessageType = z.infer<typeof messageTypeSchema>;
export type Conversation = z.infer<typeof conversationSchema>;