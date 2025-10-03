import { z } from "zod";
import { idSchema } from "./shared-schema";

export const favoriteSchema = z.object({
  client_id: idSchema,
  technician_id: idSchema,
  created_at: z.coerce.date(),
});

export type Favorite = z.infer<typeof favoriteSchema>;
