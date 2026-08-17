import { defineResponse, exact, partial } from "@/test/bdd/fixtures/registry.js";

defineResponse(
  "series.get.one-piece",
  exact({
    series: {
      id: 1,
      adult: false,
      backdropPath: "/op-bg.jpg",
      firstAirDate: "2000-01-01T00:00:00.000Z",
      tmdbId: 37854,
      inProduction: true,
      lastAirDate: "2000-01-02T00:00:00.000Z",
      name: "One Piece",
      numberOfEpisodes: 2,
      numberOfSeasons: 1,
      originalLanguage: "ja",
      originalName: "One Piece",
      overview: "Des pirates.",
      popularity: 10,
      posterPath: "/op.jpg",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z"
    },
    seasons: [],
    episodes: [],
    userSeries: {
      userId: "user-1",
      seriesId: 1,
      status: "WATCHING",
      isFavorite: true,
      watchCount: 1,
      watchedEpisodeCount: 1,
      addedAt: "2026-06-01T10:00:00.000Z",
      lastWatchedAt: "2026-08-10T20:00:00.000Z"
    },
    userEpisodes: []
  })
);

defineResponse(
  "series.get.naruto",
  exact({
    series: {
      id: 2,
      adult: false,
      backdropPath: "/naruto-bg.jpg",
      firstAirDate: "2001-01-01T00:00:00.000Z",
      tmdbId: 46260,
      inProduction: false,
      lastAirDate: "2001-01-02T00:00:00.000Z",
      name: "Naruto",
      numberOfEpisodes: 2,
      numberOfSeasons: 1,
      originalLanguage: "ja",
      originalName: "Naruto",
      overview: "Des ninjas.",
      popularity: 9,
      posterPath: "/naruto.jpg",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z"
    },
    seasons: [],
    episodes: [],
    userSeries: {
      userId: "user-1",
      seriesId: 2,
      status: "PLANNED",
      isFavorite: false,
      watchCount: 0,
      watchedEpisodeCount: 0,
      addedAt: "2026-07-01T10:00:00.000Z",
      lastWatchedAt: null
    },
    userEpisodes: []
  })
);

defineResponse(
  "series.get.one-piece-without-progress",
  exact({
    series: {
      id: 1,
      adult: false,
      backdropPath: "/op-bg.jpg",
      firstAirDate: "2000-01-01T00:00:00.000Z",
      tmdbId: 37854,
      inProduction: true,
      lastAirDate: "2000-01-02T00:00:00.000Z",
      name: "One Piece",
      numberOfEpisodes: 2,
      numberOfSeasons: 1,
      originalLanguage: "ja",
      originalName: "One Piece",
      overview: "Des pirates.",
      popularity: 10,
      posterPath: "/op.jpg",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z"
    },
    seasons: [],
    episodes: [],
    userSeries: null,
    userEpisodes: []
  })
);

defineResponse(
  "series.get.not-found",
  exact({
    code: "SERIES_NOT_FOUND",
    message: "Series not found"
  })
);

defineResponse(
  "series.get.invalid-id",
  partial({
    code: "VALIDATION_ERROR",
    message: "Invalid request"
  })
);
