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
  "sp",
  Object.values(Prisma.SeriesPeopleScalarFieldEnum)
);

export const seriesProviderTable = defineTable<SeriesProvider>(
  "SeriesProvider",
  "sp",
  Object.values(Prisma.SeriesProviderScalarFieldEnum)
);

export const queryRelations = [
  {
    from: userEpisodeTable.$name,
    to: episodeTable.$name,
    left: userEpisodeTable.episodeId,
    right: episodeTable.id
  },
  {
    from: episodeTable.$name,
    to: seriesTable.$name,
    left: episodeTable.seriesId,
    right: seriesTable.id
  },
  {
    from: seriesTable.$name,
    to: userSeriesTable.$name,
    left: seriesTable.id,
    right: userSeriesTable.seriesId
  },
  {
    from: providerTable.$name,
    to: seriesProviderTable.$name,
    left: providerTable.id,
    right: seriesProviderTable.providerId
  },
  {
    from: genreTable.$name,
    to: seriesGenreTable.$name,
    left: genreTable.id,
    right: seriesGenreTable.genreId
  }
];
