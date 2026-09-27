import type { GenreKeyByName } from "../constants/genreName";

// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

export type GenreRow = {
  id: number;
  tmdbId: number;
  name: GenreKeyByName;
  createdAt: string;
  updatedAt: string;
};
