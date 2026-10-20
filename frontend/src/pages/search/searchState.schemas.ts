import { z } from "zod";

export const searchStateSchema = z.object({
  query: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1)
});
