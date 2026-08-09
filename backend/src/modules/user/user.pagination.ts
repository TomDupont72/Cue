import z from "zod";

const USER_SERIES_CURSOR_VERSION = 1;
const USER_SERIES_CURSOR_MAX_LENGTH = 512;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

const userSeriesCursorPayloadSchema = z.strictObject({
  version: z.literal(USER_SERIES_CURSOR_VERSION),
  lastWatchedAt: z.iso.datetime({ precision: 3 }).nullable(),
  seriesId: z.number().int().positive()
});

type UserSeriesCursorPayload = z.infer<typeof userSeriesCursorPayloadSchema>;

export type UserSeriesCursor = {
  lastWatchedAt: Date | null;
  seriesId: number;
};

function parseUserSeriesCursorPayload(token: string): UserSeriesCursorPayload | null {
  if (
    token.length === 0 ||
    token.length > USER_SERIES_CURSOR_MAX_LENGTH ||
    !BASE64URL_PATTERN.test(token)
  ) {
    return null;
  }

  try {
    const encodedPayload = Buffer.from(token, "base64url");

    if (encodedPayload.toString("base64url") !== token) {
      return null;
    }

    const payload: unknown = JSON.parse(encodedPayload.toString("utf8"));
    const result = userSeriesCursorPayloadSchema.safeParse(payload);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export const userSeriesCursorTokenSchema = z
  .string()
  .min(1)
  .max(USER_SERIES_CURSOR_MAX_LENGTH)
  .refine((token) => parseUserSeriesCursorPayload(token) !== null, {
    message: "Invalid pagination cursor"
  });

export function encodeUserSeriesCursor(cursor: UserSeriesCursor): string {
  const payload = userSeriesCursorPayloadSchema.parse({
    version: USER_SERIES_CURSOR_VERSION,
    lastWatchedAt: cursor.lastWatchedAt?.toISOString() ?? null,
    seriesId: cursor.seriesId
  });

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeUserSeriesCursor(token: string): UserSeriesCursor {
  const payload = parseUserSeriesCursorPayload(token);

  if (!payload) {
    throw new TypeError("Invalid pagination cursor");
  }

  return {
    lastWatchedAt: payload.lastWatchedAt === null ? null : new Date(payload.lastWatchedAt),
    seriesId: payload.seriesId
  };
}
