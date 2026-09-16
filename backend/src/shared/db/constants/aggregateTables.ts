import {
  Prisma,
  type UserSeries,
  type Episode,
  type UserEpisode
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

export const aggregateRelations = [
  {
    from: userEpisodeTable.$name,
    to: episodeTable.$name,
    left: userEpisodeTable.episodeId,
    right: episodeTable.id
  }
];
