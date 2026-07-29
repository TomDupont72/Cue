import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const episodeRepository = {
  findOne(where: Prisma.EpisodeWhereUniqueInput, db: PrismaTx = prisma) {
    return db.episode.findUnique({
      where
    });
  },

  findMany(where: Prisma.EpisodeWhereInput, db: PrismaTx = prisma) {
    return db.episode.findMany({
      where
    });
  },

  async createMany(episodes: Prisma.EpisodeUncheckedCreateInput[], db: PrismaTx = prisma) {
    return createManyAndFetch({
      data: episodes,
      scalarFields: Prisma.EpisodeScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.episode
    });
  },

  addPeople(data: Prisma.EpisodePeopleCreateManyInput[], db: PrismaTx = prisma) {
    return db.episodePeople.createMany({
      data,
      skipDuplicates: true
    });
  },

  addCharacters(data: Prisma.EpisodeCharacterCreateManyInput[], db: PrismaTx = prisma) {
    return db.episodeCharacter.createMany({
      data,
      skipDuplicates: true
    });
  }
};
