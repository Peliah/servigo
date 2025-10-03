import { z } from "zod";
import { idSchema } from "./shared-schema";

export const messageTypeEnum = z.enum(["general", "transport_fee_proposal"]);

export const messageSchema = z.object({
  message_id: idSchema,
  request_id: idSchema,
  sender_id: idSchema,
  message_text: z.string().min(1),
  message_type: messageTypeEnum.default("general"),
  is_read: z.boolean().default(false),
  sent_at: z.coerce.date(),
});

export type MessageType = z.infer<typeof messageTypeEnum>;
export type Message = z.infer<typeof messageSchema>;
