// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

import type { GenreKeyByName } from "../constants/genreName";

export type GenreRow = {
  id: number;
  tmdbId: number;
  name: GenreKeyByName;
  createdAt: string;
  updatedAt: string;
};
