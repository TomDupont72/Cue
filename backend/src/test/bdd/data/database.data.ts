import { UserSeriesStatus } from "@/generated/prisma/enums.js";
import { DatabaseState } from "../doubles/prisma.double.js";

export const TEST_USER_IDS = {
  primary: "user-1",
  other: "user-2"
} as const;

export const TEST_SERIES_IDS = {
  onePiece: 1,
  naruto: 2
} as const;

export const TEST_TMDB_IDS = {
  onePiece: 37854,
  naruto: 46260
} as const;

export function createDefaultDatabaseState(): DatabaseState {
  const createdAt = new Date("2026-01-01T10:00:00.000Z");
  const updatedAt = new Date("2026-01-01T10:00:00.000Z");

  return {
    series: [
      {
        id: TEST_SERIES_IDS.onePiece,
        adult: false,
        backdropPath: "/op-bg.jpg",
        firstAirDate: new Date("2000-01-01"),
        tmdbId: TEST_TMDB_IDS.onePiece,
        inProduction: true,
        lastAirDate: new Date("2000-01-02"),
        name: "One Piece",
        numberOfEpisodes: 2,
        numberOfSeasons: 1,
        originalLanguage: "ja",
        originalName: "One Piece",
        overview: "Des pirates.",
        popularity: 10,
        posterPath: "/op.jpg",
        createdAt,
        updatedAt
      },
      {
        id: TEST_SERIES_IDS.naruto,
        adult: false,
        backdropPath: "/naruto-bg.jpg",
        firstAirDate: new Date("2001-01-01"),
        tmdbId: TEST_TMDB_IDS.naruto,
        inProduction: false,
        lastAirDate: new Date("2001-01-02"),
        name: "Naruto",
        numberOfEpisodes: 2,
        numberOfSeasons: 1,
        originalLanguage: "ja",
        originalName: "Naruto",
        overview: "Des ninjas.",
        popularity: 9,
        posterPath: "/naruto.jpg",
        createdAt,
        updatedAt
      }
    ],

    seasons: [],

    episodes: [],

    userSeries: [
      {
        userId: TEST_USER_IDS.primary,
        seriesId: TEST_SERIES_IDS.onePiece,
        status: UserSeriesStatus.WATCHING,
        isFavorite: true,
        watchCount: 1,
        watchedEpisodeCount: 1,
        addedAt: new Date("2026-06-01T10:00:00.000Z"),
        lastWatchedAt: new Date("2026-08-10T20:00:00.000Z")
      },
      {
        userId: TEST_USER_IDS.primary,
        seriesId: TEST_SERIES_IDS.naruto,
        status: UserSeriesStatus.PLANNED,
        isFavorite: false,
        watchCount: 0,
        watchedEpisodeCount: 0,
        addedAt: new Date("2026-07-01T10:00:00.000Z"),
        lastWatchedAt: null
      }
    ],

    userEpisodes: []
  };
}
