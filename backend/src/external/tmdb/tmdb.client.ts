import { env } from "@/shared/config/env.js";
import { logger } from "@/shared/logger/logger.js";
import z from "zod";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type QueryParams = Record<string, string | number | boolean | undefined>;

export async function tmdbGet<T>(
  path: string,
  schema: z.ZodSchema<T>,
  params: QueryParams = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  url.searchParams.set("language", "fr-FR");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.TMDB_API_TOKEN}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    logger.error(
      {
        status: response.status,
        statusText: response.statusText,
        path,
        params
      },
      "TMDB request failed"
    );

    throw new Error(`TMDB_REQUEST_FAILED_${response.status}`);
  }

  const data = await response.json();

  return schema.parse(data);
}
