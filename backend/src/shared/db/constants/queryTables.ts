import {
  Genre,
  Prisma,
  Provider,
  SeriesProvider,
  type Episode,
  type EpisodeCharacter,
  type EpisodePeople,
  type Series,
  type SeriesGenre,
  type SeriesNetwork,
  type SeriesPeople,
  type UserEpisode,
  type UserSeries
} from "@/generated/prisma/client.js";
import { defineTable } from "@/shared/db/queryTables.js";
import type { Column, TableReference } from "@/shared/db/types/relationalQuery.types.js";

export type QueryRelation = {
  from: TableReference;
  to: TableReference;
  left: Column<unknown>;
  right: Column<unknown>;
  /** Number of `from` rows related to one `to` row. */
  fromCardinality: "one" | "many";
  /** Number of `to` rows related to one `from` row. */
  toCardinality: "one" | "many";
};

export const episodeTable = defineTable<Episode>(
  "Episode",
  "e",
  Object.values(Prisma.EpisodeScalarFieldEnum)
);

export const seriesTable = defineTable<Series>(
  "Series",
  "s",
  Object.values(Prisma.SeriesScalarFieldEnum)
);

export const genreTable = defineTable<Genre>(
  "Genre",
  "g",
  Object.values(Prisma.GenreScalarFieldEnum)
);

export const providerTable = defineTable<Provider>(
  "Provider",
  "p",
  Object.values(Prisma.ProviderScalarFieldEnum)
);

export const userEpisodeTable = defineTable<UserEpisode>(
  "UserEpisode",
  "ue",
  Object.values(Prisma.UserEpisodeScalarFieldEnum)
);

export const userSeriesTable = defineTable<UserSeries>(
  "UserSeries",
  "us",
  Object.values(Prisma.UserSeriesScalarFieldEnum)
);

export const episodePeopleTable = defineTable<EpisodePeople>(
  "EpisodePeople",
  "ep",
  Object.values(Prisma.EpisodePeopleScalarFieldEnum)
);

export const episodeCharacterTable = defineTable<EpisodeCharacter>(
  "EpisodeCharacter",
  "ec",
  Object.values(Prisma.EpisodeCharacterScalarFieldEnum)
);

export const seriesGenreTable = defineTable<SeriesGenre>(
  "SeriesGenre",
  "sg",
  Object.values(Prisma.SeriesGenreScalarFieldEnum)
);

export const seriesNetworkTable = defineTable<SeriesNetwork>(
  "SeriesNetwork",
  "sn",
  Object.values(Prisma.SeriesNetworkScalarFieldEnum)
);

export const seriesPeopleTable = defineTable<SeriesPeople>(
  "SeriesPeople",
  "spe",
  Object.values(Prisma.SeriesPeopleScalarFieldEnum)
);

export const seriesProviderTable = defineTable<SeriesProvider>(
  "SeriesProvider",
  "spr",
  Object.values(Prisma.SeriesProviderScalarFieldEnum)
);

export const queryRelations: readonly QueryRelation[] = [
  {
    from: userEpisodeTable,
    to: episodeTable,
    left: userEpisodeTable.episodeId,
    right: episodeTable.id,
    fromCardinality: "many",
    toCardinality: "one"
  },
  {
    from: episodeTable,
    to: seriesTable,
    left: episodeTable.seriesId,
    right: seriesTable.id,
    fromCardinality: "many",
    toCardinality: "one"
  },
  {
    from: seriesTable,
    to: userSeriesTable,
    left: seriesTable.id,
    right: userSeriesTable.seriesId,
    fromCardinality: "one",
    toCardinality: "many"
  },
  {
    from: seriesTable,
    to: seriesProviderTable,
    left: seriesTable.id,
    right: seriesProviderTable.seriesId,
    fromCardinality: "one",
    toCardinality: "many"
  },
  {
    from: seriesProviderTable,
    to: providerTable,
    left: seriesProviderTable.providerId,
    right: providerTable.id,
    fromCardinality: "many",
    toCardinality: "one"
  },
  {
    from: seriesTable,
    to: seriesGenreTable,
    left: seriesTable.id,
    right: seriesGenreTable.seriesId,
    fromCardinality: "one",
    toCardinality: "many"
  },
  {
    from: seriesGenreTable,
    to: genreTable,
    left: seriesGenreTable.genreId,
    right: genreTable.id,
    fromCardinality: "many",
    toCardinality: "one"
  }
];
