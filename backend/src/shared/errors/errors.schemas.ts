import { z } from "zod";

export const apiErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
