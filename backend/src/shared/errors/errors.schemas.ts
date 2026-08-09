import { z } from "zod";

export const errorResponseSchema = z
  .object({
    statusCode: z.number().int().min(400).max(599),
    code: z.string(),
    error: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  })
  .meta({ id: "ErrorResponse" });

export type ErrorResponse = z.output<typeof errorResponseSchema>;
