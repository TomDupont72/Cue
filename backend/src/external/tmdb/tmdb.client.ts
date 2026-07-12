import { env } from "@/shared/config/env.js";
import { logger } from "@/shared/logger/logger.js";
import z from "zod";
import pLimit from "p-limit";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type QueryParams = Record<string, string | number | boolean | undefined>;

const limit = pLimit(3);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rawTmdbGet<TSchema extends z.ZodTypeAny>(
  path: string,
  params: QueryParams,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  url.searchParams.set("language", "fr-FR");

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.TMDB_API_TOKEN}`,
        Accept: "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      return schema.parse(data);
    }

    if (response.status === 429 || response.status >= 500) {
      const retryAfter = response.headers.get("retry-after");

      const waitMs = retryAfter ? Number(retryAfter) * 1000 : attempt * 1000;

      await sleep(waitMs);
      continue;
    }

    throw new Error(`TMDB request failed: ${response.status}`);
  }

  throw new Error("TMDB request failed after retries");
}

export function tmdbGet<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  params: QueryParams = {}
): Promise<z.infer<TSchema>> {
  return limit(() => rawTmdbGet(path, params, schema));
}
