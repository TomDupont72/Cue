import { z } from "zod";

export const commaSeparatedValuesSchema = z
  .string()
  .transform((value) => (value === "" ? [] : value.split(",")));

export const positiveIntegerStringSchema = z
  .string()
  .transform(Number)
  .pipe(z.number().int().positive());
