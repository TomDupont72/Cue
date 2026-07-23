import type {
  Character,
  Episode,
  EpisodeCharacter,
  EpisodePeople,
  Genre,
  Network,
  People,
  Season,
  Series,
  SeriesGenre,
  SeriesNetwork,
  SeriesPeople
} from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { TestContext } from "node:test";

export const ONE_PIECE_TMDB_ID = 37854;

const createdAt = new Date("2026-01-01T00:00:00.000Z");
const updatedAt = new Date("2026-01-02T00:00:00.000Z");

export type PrismaMockData = {
  series: Series[];
  seasons: Season[];
  episodes: Episode[];
  genres: Genre[];
  seriesGenres: SeriesGenre[];
  networks: Network[];
  seriesNetworks: SeriesNetwork[];
  people: People[];
  seriesPeople: SeriesPeople[];
  characters: Character[];
  episodePeople: EpisodePeople[];
  episodeCharacters: EpisodeCharacter[];
};

export const onePiecePrismaData: PrismaMockData = {
  series: [
    {
      id: 1,
      adult: false,
      backdropPath: "/one-piece-backdrop.jpg",
      firstAirDate: new Date("1999-10-20T00:00:00.000Z"),
      tmdbId: ONE_PIECE_TMDB_ID,
      inProduction: true,
      lastAirDate: new Date("2026-01-01T00:00:00.000Z"),
      name: "One Piece",
      numberOfEpisodes: 1100,
      numberOfSeasons: 22,
      originalLanguage: "ja",
      originalName: "ワンピース",
      overview: "Monkey D. Luffy parcourt Grand Line à la recherche du One Piece.",
      popularity: 150,
      posterPath: "/one-piece-poster.jpg",
      createdAt,
      updatedAt
    }
  ] satisfies Series[],
  seasons: [
    {
      id: 10,
      seriesId: 1,
      airDate: new Date("1999-10-20T00:00:00.000Z"),
      name: "East Blue",
      overview: "Le début du voyage de Luffy.",
      tmdbId: 10001,
      posterPath: "/east-blue.jpg",
      seasonNumber: 1,
      voteAverage: 8.5,
      createdAt,
      updatedAt
    },
    {
      id: 11,
      seriesId: 1,
      airDate: new Date("2001-03-21T00:00:00.000Z"),
      name: "Alabasta",
      overview: "L’équipage aide Vivi à sauver son royaume.",
      tmdbId: 10002,
      posterPath: "/alabasta.jpg",
      seasonNumber: 2,
      voteAverage: 8.7,
      createdAt,
      updatedAt
    }
  ] satisfies Season[],
  episodes: [
    {
      id: 100,
      seriesId: 1,
      seasonId: 10,
      airDate: new Date("1999-10-20T00:00:00.000Z"),
      episodeNumber: 1,
      name: "Je suis Luffy !",
      overview: "Luffy rencontre Kobby.",
      tmdbId: 20001,
      stillPath: "/episode-1.jpg",
      runtime: 24,
      seasonNumber: 1,
      voteAverage: 8.1,
      createdAt,
      updatedAt
    },
    {
      id: 101,
      seriesId: 1,
      seasonId: 10,
      airDate: new Date("1999-11-17T00:00:00.000Z"),
      episodeNumber: 2,
      name: "Le grand épéiste apparaît",
      overview: "Luffy rencontre Zoro.",
      tmdbId: 20002,
      stillPath: "/episode-2.jpg",
      runtime: 24,
      seasonNumber: 1,
      voteAverage: 8.2,
      createdAt,
      updatedAt
    },
    {
      id: 102,
      seriesId: 1,
      seasonId: 11,
      airDate: new Date("2001-03-21T00:00:00.000Z"),
      episodeNumber: 1,
      name: "En route pour Alabasta",
      overview: "L’équipage entre dans le royaume d’Alabasta.",
      tmdbId: 20003,
      stillPath: "/episode-3.jpg",
      runtime: 24,
      seasonNumber: 2,
      voteAverage: 8.4,
      createdAt,
      updatedAt
    },
    {
      id: 103,
      seriesId: 1,
      seasonId: 11,
      airDate: new Date("2001-04-15T00:00:00.000Z"),
      episodeNumber: 2,
      name: "Le combat pour le royaume",
      overview: "Luffy affronte Crocodile.",
      tmdbId: 20004,
      stillPath: "/episode-4.jpg",
      runtime: 24,
      seasonNumber: 2,
      voteAverage: 8.9,
      createdAt,
      updatedAt
    }
  ] satisfies Episode[],
  genres: [
    { id: 20, tmdbId: 16, name: "Animation", createdAt, updatedAt },
    { id: 21, tmdbId: 10759, name: "Action & Adventure", createdAt, updatedAt }
  ] satisfies Genre[],
  seriesGenres: [
    { seriesId: 1, genreId: 20 },
    { seriesId: 1, genreId: 21 }
  ] satisfies SeriesGenre[],
  networks: [
    {
      id: 30,
      tmdbId: 1,
      logoPath: "/fuji-tv.jpg",
      name: "Fuji TV",
      createdAt,
      updatedAt
    }
  ] satisfies Network[],
  seriesNetworks: [{ seriesId: 1, networkId: 30 }] satisfies SeriesNetwork[],
  people: [
    {
      id: 40,
      adult: false,
      gender: 2,
      tmdbId: 123,
      knownForDepartment: "Writing",
      name: "Eiichiro Oda",
      popularity: 10,
      profilePath: "/oda.jpg",
      createdAt,
      updatedAt
    },
    {
      id: 41,
      adult: false,
      gender: 1,
      tmdbId: 124,
      knownForDepartment: "Acting",
      name: "Mayumi Tanaka",
      popularity: 12,
      profilePath: "/tanaka.jpg",
      createdAt,
      updatedAt
    }
  ] satisfies People[],
  seriesPeople: [{ seriesId: 1, peopleId: 40 }] satisfies SeriesPeople[],
  characters: [
    { id: 50, peopleId: 41, name: "Monkey D. Luffy", createdAt, updatedAt }
  ] satisfies Character[],
  episodePeople: [
    { episodeId: 100, peopleId: 40 },
    { episodeId: 101, peopleId: 40 },
    { episodeId: 102, peopleId: 40 },
    { episodeId: 103, peopleId: 40 }
  ] satisfies EpisodePeople[],
  episodeCharacters: [
    { episodeId: 100, characterId: 50 },
    { episodeId: 101, characterId: 50 },
    { episodeId: 102, characterId: 50 },
    { episodeId: 103, characterId: 50 }
  ] satisfies EpisodeCharacter[]
};

export function createEmptyPrismaMockData(): PrismaMockData {
  return {
    series: [],
    seasons: [],
    episodes: [],
    genres: [],
    seriesGenres: [],
    networks: [],
    seriesNetworks: [],
    people: [],
    seriesPeople: [],
    characters: [],
    episodePeople: [],
    episodeCharacters: []
  };
}

function replaceMethod(t: TestContext, target: object, method: string, replacement: unknown) {
  const record = target as Record<string, unknown>;
  const original = record[method];

  record[method] = replacement;
  t.after(() => {
    record[method] = original;
  });
}

type ModelRow = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

type FindManyArgs = {
  where?: Record<string, unknown>;
};

type CreateManyArgs = {
  data: Record<string, unknown>[];
  skipDuplicates: boolean;
};

function asRecord(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

function matchesWhere(row: object, where?: Record<string, unknown>): boolean {
  if (where === undefined) return true;

  const record = asRecord(row);

  return Object.entries(where).every(([field, condition]) => {
    if (field === "OR" && Array.isArray(condition)) {
      return condition.some((part) => matchesWhere(row, part as Record<string, unknown>));
    }

    if (typeof condition === "object" && condition !== null && "in" in condition) {
      const values = (condition as { in: unknown[] }).in;
      return values.includes(record[field]);
    }

    return record[field] === condition;
  });
}

function mockModelDelegate<T extends ModelRow>(
  t: TestContext,
  delegate: object,
  rows: T[],
  uniqueFields: (keyof T)[]
) {
  const createMany = t.mock.fn(async ({ data }: CreateManyArgs) => {
    let count = 0;

    for (const input of data) {
      const duplicate = rows.some((row) =>
        uniqueFields.every((field) => asRecord(row)[field as string] === input[field as string])
      );

      if (duplicate) continue;

      const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
      rows.push({ ...input, id, createdAt, updatedAt } as T);
      count += 1;
    }

    return { count };
  });
  const findMany = t.mock.fn(async (args?: FindManyArgs) =>
    rows.filter((row) => matchesWhere(row, args?.where))
  );

  replaceMethod(t, delegate, "createMany", createMany);
  replaceMethod(t, delegate, "findMany", findMany);

  return { createMany, findMany };
}

function mockJoinDelegate<T extends object>(
  t: TestContext,
  delegate: object,
  rows: T[],
  uniqueFields: (keyof T)[]
) {
  const createMany = t.mock.fn(async ({ data }: CreateManyArgs) => {
    let count = 0;

    for (const input of data) {
      const duplicate = rows.some((row) =>
        uniqueFields.every((field) => asRecord(row)[field as string] === input[field as string])
      );

      if (duplicate) continue;

      rows.push({ ...input } as T);
      count += 1;
    }

    return { count };
  });

  replaceMethod(t, delegate, "createMany", createMany);

  return { createMany };
}

export function mockPrisma(t: TestContext, data: PrismaMockData = onePiecePrismaData) {
  const seriesFindUnique = t.mock.fn(
    async ({ where }: { where: { id?: number; tmdbId?: number } }) =>
      data.series.find(
        (series) =>
          (where.id !== undefined && series.id === where.id) ||
          (where.tmdbId !== undefined && series.tmdbId === where.tmdbId)
      ) ?? null
  );
  const seriesFindMany = t.mock.fn(async () => data.series);
  const seriesUpsert = t.mock.fn(
    async ({
      where,
      create,
      update
    }: {
      where: { id?: number; tmdbId?: number };
      create: Omit<Series, "id" | "createdAt" | "updatedAt">;
      update: Partial<Series>;
    }) => {
      const existing = data.series.find(
        (series) =>
          (where.id !== undefined && series.id === where.id) ||
          (where.tmdbId !== undefined && series.tmdbId === where.tmdbId)
      );

      if (existing !== undefined) {
        Object.assign(existing, update, { updatedAt });
        return existing;
      }

      const series = {
        ...create,
        id: Math.max(0, ...data.series.map((item) => item.id)) + 1,
        createdAt,
        updatedAt
      } as Series;
      data.series.push(series);
      return series;
    }
  );

  const season = mockModelDelegate(t, prisma.season, data.seasons, ["tmdbId"]);
  const episode = mockModelDelegate(t, prisma.episode, data.episodes, ["tmdbId"]);
  const genre = mockModelDelegate(t, prisma.genre, data.genres, ["tmdbId"]);
  const network = mockModelDelegate(t, prisma.network, data.networks, ["tmdbId"]);
  const people = mockModelDelegate(t, prisma.people, data.people, ["tmdbId"]);
  const character = mockModelDelegate(t, prisma.character, data.characters, ["peopleId", "name"]);
  const seriesGenre = mockJoinDelegate(t, prisma.seriesGenre, data.seriesGenres, [
    "seriesId",
    "genreId"
  ]);
  const seriesNetwork = mockJoinDelegate(t, prisma.seriesNetwork, data.seriesNetworks, [
    "seriesId",
    "networkId"
  ]);
  const seriesPeople = mockJoinDelegate(t, prisma.seriesPeople, data.seriesPeople, [
    "seriesId",
    "peopleId"
  ]);
  const episodePeople = mockJoinDelegate(t, prisma.episodePeople, data.episodePeople, [
    "episodeId",
    "peopleId"
  ]);
  const episodeCharacter = mockJoinDelegate(t, prisma.episodeCharacter, data.episodeCharacters, [
    "episodeId",
    "characterId"
  ]);
  const userSeriesFindUnique = t.mock.fn(async () => null);
  const transaction = t.mock.fn(
    async <TResult>(callback: (tx: typeof prisma) => Promise<TResult>) => callback(prisma)
  );

  replaceMethod(t, prisma.series, "findUnique", seriesFindUnique);
  replaceMethod(t, prisma.series, "findMany", seriesFindMany);
  replaceMethod(t, prisma.series, "upsert", seriesUpsert);
  replaceMethod(t, prisma.userSeries, "findUnique", userSeriesFindUnique);
  replaceMethod(t, prisma, "$transaction", transaction);

  return {
    data,
    transaction,
    series: { findUnique: seriesFindUnique, findMany: seriesFindMany, upsert: seriesUpsert },
    season,
    episode,
    genre,
    network,
    people,
    character,
    seriesGenre,
    seriesNetwork,
    seriesPeople,
    episodePeople,
    episodeCharacter,
    userSeries: { findUnique: userSeriesFindUnique }
  };
}
