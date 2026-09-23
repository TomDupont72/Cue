// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

export type ProviderRow = {
  id: number;
  tmdbId: number;
  name: string;
  logoPath: string | null;
  displayPriority: number;
  createdAt: string;
  updatedAt: string;
};
