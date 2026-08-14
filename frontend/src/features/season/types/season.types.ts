// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

export type SeasonRow = {
    id: number,
    seriesId: number,
    airDate?: string,
    name: string,
    overview?: string,
    tmdbId: number,
    posterPath?: string,
    seasonNumber: number,
    voteAverage: number,
  createdAt: string;
  updatedAt: string;    
}