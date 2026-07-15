type TmdbImageSize = "w185" | "w300" | "w342" | "w500" | "w780" | "w1280" | "original";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

export function getTmdbImageUrl(
  path: string | null | undefined,
  size: TmdbImageSize = "w500"
): string | null {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_URL}/${size}${path}`;
}
