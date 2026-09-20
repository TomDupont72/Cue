import {
  Prisma,
  type Episode,
  type EpisodeCharacter,
  type EpisodePeople,
  type SeriesGenre,
  type SeriesNetwork,
  type SeriesPeople,
  type UserEpisode,
  type UserSeries
} from "@/generated/prisma/client.js";
import { defineTable } from "@/shared/db/aggregateTables.js";

export const episodeTable = defineTable<Episode>(
  "Episode",
  "e",
  Object.values(Prisma.EpisodeScalarFieldEnum)
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

export const aggregateRelations = [
  {
    from: userEpisodeTable.$name,
    to: episodeTable.$name,
    left: userEpisodeTable.episodeId,
    right: episodeTable.id
  }
];
